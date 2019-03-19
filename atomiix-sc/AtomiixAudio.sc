

AtomiixAudio {

  var proxyspace;
  var agentDict;
  var effectsDict;
  var instrumentDict;
  var numChan;
  var oscOutPort;

  init{| instrDict, fxDict, outPort, numChannels = 2 |
    TempoClock.default.tempo = 120/60;
    proxyspace = ProxySpace.new.know_(true);
    agentDict = IdentityDictionary.new;
    instrumentDict = instrDict;
    effectsDict = fxDict;
    oscOutPort = outPort;
    numChan = numChannels
  }

  setAgent{| agentName |
    if(agentDict[agentName].isNil, {
      // 1st = effectRegistryDict, 2nd = scoreInfoDict, 3rd = placeholder for a routine
      agentDict[agentName] = [(), ().add(\amp->0.5), []];
    });
    ^agentDict[agentName];
  }

  actionAgent{| agentName, action |
    if (agentDict[agentName].notNil, {
      action.value(agentName, agentDict[agentName]);
    }, {
      "No agent named %\n".format(agentName).postln;
    });
  }

  registerCallback{| time, timeType, repeats, callbackID |
    {
      repeats.do({| num |
        if(timeType == \beats, {
          (time * TempoClock.default.tempo).wait;
        },{
          time.wait;
        });
        {
          "calling callback %".format(callbackID).postln;
          this.actionCallback(callbackID, (repeats - 1) - num);
        }.defer;
      });
    }.fork(TempoClock.new)
  }

  actionCallback{| callbackID, remaining |
    oscOutPort.sendMsg("/callback", callbackID, remaining);
  }

  changeTempo{| newTempo, glide |
    [newTempo, glide].postln;
    if(glide.notNil, {
      TempoClock.default.sync(newTempo/60, glide);
    }, {
      TempoClock.default.tempo = newTempo/60;
    });
    "---> Setting tempo to %".format(newTempo).postln;
  }

  freeAgent{| agentName |
    this.actionAgent(agentName, {| agentName |
      "Freeing agent: %\n".format(agentName).postln;
      agentDict[agentName][1].playstate = false;
      proxyspace[agentName].clear;
      agentDict[agentName] = nil;
    });
  }

  dozeAgent{| agentName |
    this.actionAgent(agentName, {| name |
      "Dozing agent: %\n".format(name).postln;
      agentDict[name][1].playstate = false;
      proxyspace[name].stop;
    });
  }

  wakeAgent{| agentName |
    this.actionAgent(agentName, {| agentName |
      "Waking agent: %\n".format(agentName).postln;
      agentDict[agentName][1].playstate = true;
      proxyspace[agentName].play;
    });
  }

  reinitScore {| agentName |
    this.actionAgent(agentName, {| agentName, agent |
      var scoreType = agent[1].mode;
      switch (scoreType,
        \percussive, { this.playPercussiveScore(agentName, agent[1]) },
        \melodic, { this.playMelodicScore(agentName, agent[1]) },
        \concrete, { this.playConcreteScore(agentName, agent[1]) },
        { "unknown score type: %\n".format(scoreType).postln }
      )
    });
  }

  setAgentAmplitude{| agentName, amplitude |
    this.actionAgent(agentName, {| agentName, agent |
      agent[1].amp = amplitude.clip(0, 2);
      if(agent[1].mode == \concrete, {
        Pdef(agentName).set(\amp, agent[1].amp);
      });
      "Changing % amp to %\n".format(agentName, amplitude, agent[1].amp).postln;
    });
  }

  addEffect{| agentName, effects |
    this.actionAgent(agentName, {| agentName, agent |
      var agentFX = agent[0];
      effects.do({|effect|
        var fx;
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
    });
  }

  removeEffect{| agentName, effects |
    this.actionAgent(agentName, {| agentName, agent |
      var agentFX = agent[0];

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
    });
  }

  agentFinished{| agentName |
    "Agent % has finished playing".format(agentName).postln;
    oscOutPort.sendMsg("/finished", agentName);
  }

  createFinishingSeq{| agentName, durationArray, repeats |
    if (repeats != inf, {
      var durations = Pseq(durationArray, repeats).asStream;
      ^Pfunc{
        var nd = durations.next();
        if(nd.isNil, {this.agentFinished(agentName)});
        nd;
      }
    }, {
      ^Pseq(durationArray, repeats);
    });
  }

  createAttackSeq{| agent, attackArray |
    var attacks = Pseq(attackArray, inf).asStream;
    ^Pfunc{ attacks.next() * agent[1].amp}
  }

  playPercussiveScore{| agentName, scoreInfo |
    var pdef, agent, instruments, newInstrFlag, durationSequence, attackSequence;
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
    agent[1].instrumentNames = scoreInfo.instrumentNames;
    agent[1].instruments = instruments;
    agent[1].sustainArray = scoreInfo.sustainArray;
    agent[1].attackArray = scoreInfo.attackArray;
    agent[1].panArray = scoreInfo.panArray;
    agent[1].quantphase = scoreInfo.quantphase;
    agent[1].repeats = scoreInfo.repeats;

    durationSequence = this.createFinishingSeq(agentName, scoreInfo.durations, scoreInfo.repeats);
    attackSequence = this.createAttackSeq(agent, scoreInfo.attackArray);

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
        \dur, durationSequence,
        \amp, attackSequence,
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
          \dur, durationSequence,
          \amp, attackSequence,
          \sustain, Pseq(scoreInfo.sustainArray, inf),
          \pan, Pseq(scoreInfo.panArray, inf)
        )).quant = [scoreInfo.durations.sum, scoreInfo.quantphase];

        // defer needed as the free above and play immediately doesn't work
        { proxyspace[agentName].play }.defer(0.5);
      }, {  
        pdef = Pdef(agentName, Pbind(
          \instrument, Pseq(instruments, inf), 
          \midinote, Pseq(scoreInfo.notes, inf), 
          \dur, durationSequence,
          \amp, attackSequence,
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
    var pdef, agent, newInstrFlag, durationSequence, attackSequence;
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

    durationSequence = this.createFinishingSeq(agentName, scoreInfo.durations, scoreInfo.repeats);
    attackSequence = this.createAttackSeq(agent, scoreInfo.attackArray);

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
        \dur, durationSequence,
        \sustain, Pseq(scoreInfo.sustainArray, inf),
        \amp, attackSequence,
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
          \dur, durationSequence,
          \sustain, Pseq(scoreInfo.sustainArray, inf),
          \amp, attackSequence,
          \pan, Pseq(scoreInfo.panArray, inf)
        )).quant = [scoreInfo.durations.sum, scoreInfo.quantphase, 0, 1];

        proxyspace[agentName].defineBus(numChannels: numChan);

        // defer needed as the free above and play immediately doesn't work
        { proxyspace[agentName].play }.defer(0.5);
      }, {
        pdef = Pdef(agentName, Pbind(
          \instrument, scoreInfo.instrument,
          \midinote, Pseq(scoreInfo.notes, inf),
          \dur, durationSequence,
          \sustain, Pseq(scoreInfo.sustainArray, inf),
          \amp, attackSequence,
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
    var pdef, agent, newInstrFlag, durationSequence;
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

    durationSequence = this.createFinishingSeq(agentName, scoreInfo.durations, scoreInfo.repeats);

    if(proxyspace[agentName].isNeutral || (scoreInfo.repeats != inf), {
      // needed because of repeats (free proxyspace timing)
      proxyspace[agentName].free;
      // oh dear. Proxyspace forces this, as one might want to put an
      // effect again on a repeat pat
      10.do({arg i; proxyspace[agentName][i+1] =  nil });

      // clear the effect references
      agentDict[agentName][0].clear;

      // Only make one of these sequences a Finishing Sequence
      // so we only get one alert
      Pdefn((agentName++"durations").asSymbol, durationSequence);
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
      // Only make one of these sequences a Finishing Sequence
      // so we only get one alert
      Pdefn((agentName++"durations").asSymbol, durationSequence).quant = [scoreInfo.durations.sum, scoreInfo.quantphase, 0, 1];
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
