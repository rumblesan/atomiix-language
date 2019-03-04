

AtomiixSequencer {

  var proxyspace;
  var agentDict;
  var numChan;

  init{|numChannels = 2|
    TempoClock.default.tempo = 120/60;
    proxyspace = ProxySpace.new.know_(true);
    agentDict = IdentityDictionary.new;
    numChan = numChannels
  }

  newAgent{| agentName |
    agentDict[agentName] = [(), ().add(\amp->0.5), []];
    ^agentDict[agentName];
  }

  playPercussionScore{| agentName, noteArray, durArray, instArray, sustainArray, attackArray, panArray, quantPhase, repeats, newInstFlag |
    var pdef;
    if(proxyspace[agentName].isNeutral || (repeats != inf), { // check if the object exists already
      proxyspace[agentName].free; // needed because of repeats (free proxyspace timing)
      10.do({arg i; proxyspace[agentName][i+1] =  nil }); // oh dear. Proxyspace forces this, as one might want to put an effect again on a repeat pat
      agentName[agentName][0].clear; // clear the effect references

      pdef = Pdef(agentName, Pbind(
          \instrument, Pseq(instArray, inf), 
          \midinote, Pseq(noteArray, inf), 
          \dur, Pseq(durArray, repeats),
          \amp, Pseq(attackArray*agentName[agentName][1].amp, inf),
          \sustain, Pseq(sustainArray, inf),
          \pan, Pseq(panArray, inf)
      ));

      {
          proxyspace[agentName].quant = [durArray.sum, quantPhase, 0, 1];
          proxyspace[agentName].defineBus(numChannels: numChan);
          proxyspace[agentName] = Pdef(agentName);
          proxyspace[agentName].play;
      }.defer(0.5);
    }, {
        if(newInstFlag, { // only if instrument was {, where Pmono bufferplayer synthdef needs to be shut down (similar to above, but no freeing of effects)
            proxyspace[agentName].free; // needed in order to swap instrument in Pmono
            pdef = Pdef(agentName, Pbind(
                \instrument, Pseq(instArray, inf), 
                \midinote, Pseq(noteArray, inf), 
                \dur, Pseq(durArray, repeats),
                \amp, Pseq(attackArray*agentDict[agentName][1].amp, inf),
                \sustain, Pseq(sustainArray, inf),
                \pan, Pseq(panArray, inf)
            )).quant = [durArray.sum, quantPhase];
            {
              proxyspace[agentName].play
            }.defer(0.5); // defer needed as the free above and play immediately doesn't work
        }, {  
            // default behavior
            pdef = Pdef(agentName, Pbind(
                \instrument, Pseq(instArray, inf), 
                \midinote, Pseq(noteArray, inf), 
                \dur, Pseq(durArray, repeats),
                \amp, Pseq(attackArray*agentDict[agentName][1].amp, inf),
                \sustain, Pseq(sustainArray, inf),
                \pan, Pseq(panArray, inf)
            )).quant = [durArray.sum, quantPhase];
            if(agentDict[agentName][1].playstate == false, {
                proxyspace[agentName].play; // this would build up synths on server on commands such as yoyo agent
            });
        });
    });
    ^pdef;
  }
}
