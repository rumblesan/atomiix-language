

Atomiix {

  var instruments, audioEngine;

  init {| configPath, project, oscPort |
    "Booting Atomiix...".postln;
    instruments = AtomiixInstruments.new.init(configPath, project);
    audioEngine = AtomiixAudio.new.init(
      instruments.makeInstrDict,
      instruments.makeEffectDict
    );
    this.setupOSC(oscPort);
  }

  setupOSC {| oscPort |
    "Setting up OSC listeners".postln;

    OSCFunc({| msg |
      var values = msg.unfoldOSC();
      var scoreType = values[1];
      switch (scoreType,
        \percussive, { this.playPercussiveScore(values[2..]) },
        \melodic, { this.playMelodicScore(values[2..]) },
        \concrete, { this.playConcreteScore(values[2..]) },
        { "unknown score type: %\n".format(scoreType).postln }
      )
    }, '/play/pattern', NetAddr("localhost"), oscPort);

    OSCFunc({| msg |
      audioEngine.freeAgent(msg[1]);
    }, '/free', NetAddr("localhost"), oscPort);

    OSCFunc({| msg |
      var agentName, change;
      msg.postln;
      agentName = msg[1];
      change = msg[2];
      audioEngine.changeAgentAmplitude(agentName, change);
    }, '/agent/amplitude', NetAddr("localhost"), oscPort);

    OSCFunc({| msg |
      var values, agentName, effects;
      values = msg.unfoldOSC();
      agentName = values[1];
      effects = values[2];
      audioEngine.addEffect(agentName, effects);
    }, '/agent/effects/add', NetAddr("localhost"), oscPort);

    OSCFunc({| msg |
      var values, agentName, effects;
      values = msg.unfoldOSC();
      agentName = values[1];
      effects = values[2];
      audioEngine.removeEffect(agentName, effects);
    }, '/agent/effects/remove', NetAddr("localhost"), oscPort);

    "Atomiix-SC: Listening on port %\n".format(oscPort).postln;
  }

  playPercussiveScore {| scoreData |
    var agentName, args;
    agentName = scoreData[0];
    args = ();
    args.notes = scoreData[1];
    args.durations = scoreData[2];
    args.instrumentNames = scoreData[3];
    args.sustainArray = scoreData[4];
    args.attackArray = scoreData[5];
    args.panArray = scoreData[6];
    args.quantphase = scoreData[7];
    args.repeats = scoreData[8];
    audioEngine.playPercussiveScore(agentName, args);
  }

  playMelodicScore {| scoreData |
    var agentName, args;
    agentName = scoreData[0];
    args = ();
    args.notes = scoreData[1];
    args.durations = scoreData[2];
    args.instrument = scoreData[3];
    args.sustainArray = scoreData[4];
    args.attackArray = scoreData[5];
    args.panArray = scoreData[6];
    args.quantphase = scoreData[7];
    args.repeats = scoreData[8];
    audioEngine.playMelodicScore(agentName, args);
  }

  playConcreteScore {| scoreData |
    var agentName, args;
    agentName = scoreData[0];
    args = ();
    args.pitch = scoreData[1];
    args.amplitudes = scoreData[2];
    args.durations = scoreData[3];
    args.instrument = scoreData[4];
    args.panArray = scoreData[5];
    args.quantphase = scoreData[6];
    args.repeats = scoreData[7];
    audioEngine.playConcreteScore(agentName, args);
  }

}