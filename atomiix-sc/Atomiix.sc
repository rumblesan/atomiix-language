

Atomiix {

  var instruments, audioEngine;

  init {| configPath, project, oscInPort, oscOutPort, oscOutHost = "127.0.0.1" |
    var outPort;
    "Booting Atomiix...".postln;

    outPort = NetAddr.new(oscOutHost, oscOutPort);

    instruments = AtomiixInstruments.new.init(configPath, project);
    audioEngine = AtomiixAudio.new.init(
      instruments.makeInstrDict,
      instruments.makeEffectDict,
      outPort
    );
    this.setupOSC(oscInPort);
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
      var command = msg[1];
      switch (command,
        \free, {audioEngine.freeAgent(msg[2])},
        \doze, {audioEngine.dozeAgent(msg[2])},
        \wake, {audioEngine.wakeAgent(msg[2])}
      )
    }, '/command', NetAddr("localhost"), oscPort);

    OSCFunc({| msg |
      msg.postln;
      audioEngine.changeTempo(msg[1], msg[2]);
    }, '/tempo', NetAddr("localhost"), oscPort);

    OSCFunc({| msg |
      var agentName, value;
      agentName = msg[1];
      value = msg[2];
      audioEngine.setAgentAmplitude(agentName, value);
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

    OSCFunc({| msg |
      var time, timeType, repeats, callbackID;
      time = msg[1];
      timeType = msg[2];
      repeats = msg[3];
      callbackID = msg[4];
      audioEngine.registerCallback(time, timeType, repeats, callbackID);
    }, '/callback', NetAddr("localhost"), oscPort);

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
