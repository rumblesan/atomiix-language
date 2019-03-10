

AtomiixAudio {

  var proxyspace;
  var agentDict;
  var effectsDict;
  var instrumentDict;
  var numChan;

  init{| instrDict, fxDict, numChannels = 2 |
    TempoClock.default.tempo = 120/60;
    proxyspace = ProxySpace.new.know_(true);
    agentDict = IdentityDictionary.new;
    instrumentDict = instrDict;
    effectsDict = fxDict;
    numChan = numChannels
  }

  setAgent{| agentName |
    if(agentDict[agentName].isNil, {
      // 1st = effectRegistryDict, 2nd = scoreInfoDict, 3rd = placeholder for a routine
      agentDict[agentName] = [(), ().add(\amp->0.5), []];
    });
    ^agentDict[agentName];
  }

  freeAgent{| agentName |
    if (agentDict[agentName].notNil, {
      "Freeing agent: %\n".format(agentName).postln;
      agentDict[agentName][1].playstate = false;
      proxyspace[agentName].clear;
      agentDict[agentName] = nil;
    }, {
      "No agent named %\n".format(agentName).postln;
    });
  }

  changeAgentAmplitude{| agentName, change |
    var agent = agentDict[agentName];
    if (agent.notNil, {
      agent[1].amp = agent[1].amp + change;
      "Changing % amp by % to %\n".format(agentName, change, agent[1].amp).postln;
    }, {
      "No agent named %\n".format(agentName).postln;
    });
  }

  addEffect{| agentName, effects |
    var agent, agentFX, fx;
    agent = agentDict[agentName];
    if (agent.notNil, {
      agentFX = agent[0];

      effects.do({|effect|
        if(agentFX[effect.asSymbol].isNil, {
          // add 1 (the source is 1)
          agentFX[effect.asSymbol] = agentFX.size+1;

          fx = effectsDict[effect.asSymbol];
          if(fx.notNil, {
            "Adding effect % to %\n".format(effect, agentName).postln;
            proxyspace[agentName][agentFX.size] = \filter -> fx;
          }, {
            "No effect named %\n".format(effect).postln;
          });
        });
      });

    }, {
      "No agent named %\n".format(agentName).postln;
    });
  }

  removeEffect{| agentName, effects |
    var agent, agentFX, fx;
    agent = agentDict[agentName];
    if (agent.notNil, {
      agentFX = agent[0];

      if (effects.isNil, {
        // remove all effects (10 max) (+1 as 0 is Pdef)
        10.do({arg i; proxyspace[agentName][i+1] =  nil });
        agentFX.clear;
      }, {
        effects.do({|effect|
          if (agentFX[effect.asSymbol].notNil, {
            // TODO should this handle the gaps it creates?
            proxyspace[agentName][(agentFX[effect.asSymbol]).clip(1,10)] =  nil;
            agentFX.removeAt(effect.asSymbol);
          });
        });
      });

    }, {
      "No agent named %\n".format(agentName).postln;
    });
  }

  playPercussiveScore{| agentName, scoreInfo |
    var pdef, agent, instruments, newInstrFlag;
    ["percussive", agentName, scoreInfo].postln;

    agent = this.setAgent(agentName);
    newInstrFlag = false;
    instruments = [];

    // trick to free if the agent was { instr (Pmono is always on)
    if(agent[1].mode == \concrete, { newInstrFlag = true });

    scoreInfo.instrumentNames.collect({arg instr, i; instruments = instruments.add(instrumentDict[instr.asSymbol]) });

    agent[1].mode = \percussive;
    agent[1].notes = scoreInfo.notes;
    agent[1].durations = scoreInfo.durations;
    agent[1].instruments = instruments;
    agent[1].sustainArray = scoreInfo.sustainArray;
    agent[1].attackArray = scoreInfo.attackArray;
    agent[1].panArray = scoreInfo.panArray;
    agent[1].quantphase = scoreInfo.quantphase;
    agent[1].repeats = scoreInfo.repeats;

    if(proxyspace[agentName].isNeutral || (scoreInfo.repeats != inf), {
      // needed because of repeats (free proxyspace timing)
      proxyspace[agentName].free;
      // oh dear. Proxyspace forces this, as one might want to put an
      // effect again on a repeat pat
      10.do({arg i; proxyspace[agentName][i+1] =  nil });
      // clear the effect references
      agent[0].clear;

      pdef = Pdef(agentName, Pbind(
        \instrument, Pseq(instruments, inf), 
        \midinote, Pseq(scoreInfo.notes, inf), 
        \dur, Pseq(scoreInfo.durations, scoreInfo.repeats),
        \amp, Pseq(scoreInfo.attackArray * agent[1].amp, inf),
        \sustain, Pseq(scoreInfo.sustainArray, inf),
        \pan, Pseq(scoreInfo.panArray, inf)
      ));

      {
        proxyspace[agentName].quant = [scoreInfo.durations.sum, scoreInfo.quantphase, 0, 1];
        proxyspace[agentName].defineBus(numChannels: numChan);
        proxyspace[agentName] = Pdef(agentName);
        proxyspace[agentName].play;
      }.defer(0.5);
    }, {
      if(newInstrFlag, {
        // only if instrument was concrete where Pmono bufferplayer synthdef needs
        // to be shut down (similar to above, but no freeing of effects)

        // needed in order to swap instrument in Pmono
        proxyspace[agentName].free;

        pdef = Pdef(agentName, Pbind(
          \instrument, Pseq(instruments, inf), 
          \midinote, Pseq(scoreInfo.notes, inf), 
          \dur, Pseq(scoreInfo.durations, scoreInfo.repeats),
          \amp, Pseq(scoreInfo.attackArray * agent[1].amp, inf),
          \sustain, Pseq(scoreInfo.sustainArray, inf),
          \pan, Pseq(scoreInfo.panArray, inf)
        )).quant = [scoreInfo.durations.sum, scoreInfo.quantphase];

        // defer needed as the free above and play immediately doesn't work
        { proxyspace[agentName].play }.defer(0.5);
      }, {  
        pdef = Pdef(agentName, Pbind(
          \instrument, Pseq(instruments, inf), 
          \midinote, Pseq(scoreInfo.notes, inf), 
          \dur, Pseq(scoreInfo.durations, scoreInfo.repeats),
          \amp, Pseq(scoreInfo.attackArray * agent[1].amp, inf),
          \sustain, Pseq(scoreInfo.sustainArray, inf),
          \pan, Pseq(scoreInfo.panArray, inf)
        )).quant = [scoreInfo.durations.sum, scoreInfo.quantphase];
        if(agent[1].playstate == false, {
          // this would build up synths on server on commands such as yoyo agent
          proxyspace[agentName].play;
        });
      });
    });
    ^pdef;
  }

  playMelodicScore {| agentName, scoreInfo |
    var pdef, agent, newInstrFlag;
    ["melodic", agentName, scoreInfo].postln;

    agent = this.setAgent(agentName);
    newInstrFlag = false;
    // trick to free if the agent was { instr (Pmono is always on)
    if(agent[1].mode == \concrete, { newInstrFlag = true });

    agent[1].mode = \melodic;
    agent[1].notes = scoreInfo.notes;
    agent[1].durations = scoreInfo.durations;
    agent[1].instrument = scoreInfo.instrument;
    agent[1].sustainArray = scoreInfo.sustainArray;
    agent[1].attackArray = scoreInfo.attackArray;
    agent[1].panArray = scoreInfo.panArray;
    agent[1].quantphase = scoreInfo.quantphase;
    agent[1].repeats = scoreInfo.repeats;

    if(proxyspace[agentName].isNeutral || (scoreInfo.repeats != inf), {
      // needed because of repeats (free proxyspace timing)
      proxyspace[agentName].free;
      // oh dear. Proxyspace forces this, as one might want to put an
      // effect again on a repeat pat
      10.do({arg i; proxyspace[agentName][i+1] =  nil });
      // clear the effect references
      agent[0].clear;

      pdef = Pdef(agentName, Pbind(
        \instrument, scoreInfo.instrument,
        \type, \note,
        \midinote, Pseq(scoreInfo.notes, inf),
        \dur, Pseq(scoreInfo.durations, scoreInfo.repeats),
        \sustain, Pseq(scoreInfo.sustainArray, inf),
        \amp, Pseq(scoreInfo.attackArray * agent[1].amp, inf),
        \pan, Pseq(scoreInfo.panArray, inf)
      ));

      {
        proxyspace[agentName].quant = [scoreInfo.durations.sum, scoreInfo.quantphase, 0, 1];
        proxyspace[agentName].defineBus(numChannels: numChan);
        proxyspace[agentName] = Pdef(agentName);
        proxyspace[agentName].play;
      }.defer(0.5);
    },{
      if(newInstrFlag, {
        // only if instrument was concrete where Pmono bufferplayer synthdef needs
        // to be shut down (similar to above, but no freeing of effects)

        // needed in order to swap instrument in Pmono
        proxyspace[agentName].free;

        pdef = Pdef(agentName, Pbind(
          \instrument, scoreInfo.instrument,
          \midinote, Pseq(scoreInfo.notes, inf),
          \dur, Pseq(scoreInfo.durations, scoreInfo.repeats),
          \sustain, Pseq(scoreInfo.sustainArray, inf),
          \amp, Pseq(scoreInfo.attackArray * agent[1].amp, inf),
          \pan, Pseq(scoreInfo.panArray, inf)
        )).quant = [scoreInfo.durations.sum, scoreInfo.quantphase, 0, 1];

        proxyspace[agentName].defineBus(numChannels: numChan);

        // defer needed as the free above and play immediately doesn't work
        { proxyspace[agentName].play }.defer(0.5);
      }, {
        pdef = Pdef(agentName, Pbind(
          \instrument, scoreInfo.instrument,
          \midinote, Pseq(scoreInfo.notes, inf),
          \dur, Pseq(scoreInfo.durations, scoreInfo.repeats),
          \sustain, Pseq(scoreInfo.sustainArray, inf),
          \amp, Pseq(scoreInfo.attackArray * agent[1].amp, inf),
          \pan, Pseq(scoreInfo.panArray, inf)
        )).quant = [scoreInfo.durations.sum, scoreInfo.quantphase, 0, 1];

        if(agent[1].playstate == false, {
          proxyspace[agentName].defineBus(numChannels: numChan);
          // this would build up synths on server on commands such as yoyo agent
          proxyspace[agentName].play;
        });
      });
    });
    agent[1].playstate = true;
    ^pdef
  }

  playConcreteScore{| agentName, scoreInfo|
    var pdef, agent, newInstrFlag;
    ["concrete", agentName, scoreInfo].postln;

    agent = this.setAgent(agentName);
    newInstrFlag = false;
    // due to Pmono not being able to load a new instr, check
    // if it is a new one and free the old one if it is
    if(agent[1].instrument != scoreInfo.instrument, { newInstrFlag = true });
    if(agent[1].pitch != scoreInfo.pitch, { newInstrFlag = true });

    agent[1].mode = \concrete;
    agent[1].pitch = scoreInfo.pitch;
    agent[1].amplitudes = scoreInfo.amplitudes;
    agent[1].durations = scoreInfo.durations;
    agent[1].instrument = scoreInfo.instrument;
    agent[1].panArray = scoreInfo.panArray;
    agent[1].quantphase = scoreInfo.quantphase;
    agent[1].repeats = scoreInfo.repeats;

    if(proxyspace[agentName].isNeutral || (scoreInfo.repeats != inf), {
      // needed because of repeats (free proxyspace timing)
      proxyspace[agentName].free;
      // oh dear. Proxyspace forces this, as one might want to put an
      // effect again on a repeat pat
      10.do({arg i; proxyspace[agentName][i+1] =  nil });

      // clear the effect references
      agentDict[agentName][0].clear;

      Pdefn((agentName++"durations").asSymbol, Pseq(scoreInfo.durations, scoreInfo.repeats));
      Pdefn((agentName++"amplitudes").asSymbol, Pseq(scoreInfo.amplitudes, scoreInfo.repeats));
      pdef = Pdef(agentName, Pmono(scoreInfo.instrument,
            \dur, Pdefn((agentName++"durations").asSymbol),
            \freq, scoreInfo.pitch.midicps,
            \noteamp, Pdefn((agentName++"amplitudes").asSymbol),
            \pan, Pseq(scoreInfo.panArray, inf)
      ));
      {
        proxyspace[agentName].quant = [scoreInfo.durations.sum, scoreInfo.quantphase, 0, 1];
        proxyspace[agentName].defineBus(numChannels: numChan);
        proxyspace[agentName] = Pdef(agentName);
        proxyspace[agentName].play
      }.defer(0.5);
    }, {
      Pdefn((agentName++"durations").asSymbol, Pseq(scoreInfo.durations, scoreInfo.repeats)).quant = [scoreInfo.durations.sum, scoreInfo.quantphase, 0, 1];
      Pdefn((agentName++"amplitudes").asSymbol, Pseq(scoreInfo.amplitudes, scoreInfo.repeats)).quant = [scoreInfo.durations.sum, scoreInfo.quantphase, 0, 1];
      if(newInstrFlag, {
        // needed in order to swap instrument in Pmono
        proxyspace[agentName].free;
        pdef = Pdef(agentName, Pmono(scoreInfo.instrument,
              \dur, Pdefn((agentName++"durations").asSymbol),
              \freq, scoreInfo.pitch.midicps,
              \noteamp, Pdefn((agentName++"amplitudes").asSymbol),
              \pan, Pseq(scoreInfo.panArray, inf)
        ));
        // defer needed as the free above and play immediately doesn't work
        {
          proxyspace[agentName].defineBus(numChannels: numChan);
          proxyspace[agentName] = Pdef(agentName);
          proxyspace[agentName].play
        }.defer(0.5);
      });
    });
    // proxyspace quirk: amp set from outside
    Pdef(agentName).set(\amp, agent[1].amp);
    agent[1].playstate = true;
    ^pdef;
  }

}