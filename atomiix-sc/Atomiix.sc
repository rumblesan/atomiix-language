

Atomiix {

	var instruments, sequencer;

	init {| configPath, project, oscPort, numChannels |
		"Booting Atomiix...".postln;
		instruments = AtomiixInstr.new.init(configPath, project, numChannels);
		sequencer = AtomiixSequencer.new.init(instruments.makeInstrDict, numChannels);
		this.setupOSC(oscPort);
	}

  setupOSC {| oscPort |
    "Setting up OSC listeners".postln;

    OSCFunc({|msg, time, addr, recvPort|
      var values = msg.unfoldOSC();
      var scoreType = values[1];
      switch (scoreType,
        \percussive, { this.playPercussiveScore(values[2..]) },
        \melodic, { this.playMelodicScore(values[2..]) },
        \concrete, { this.playConcreteScore(values[2..]) },
        { "unknown score type: %\n".format(scoreType).postln }
      )
    }, '/play/pattern', NetAddr("localhost"), oscPort);

    OSCFunc({|msg, time, addr, recvPort|
      sequencer.freeAgent(msg[1]);
    }, '/free', NetAddr("localhost"), oscPort);

    "Atomiix-SC: Listening on port %\n".format(oscPort).postln;
  }

  playPercussiveScore {|scoreData|
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
		sequencer.playPercussiveScore(agentName, args);
  }

  playMelodicScore {|scoreData|
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
		sequencer.playMelodicScore(agentName, args);
  }

  playConcreteScore {|scoreData|
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
		sequencer.playConcreteScore(agentName, args);
  }

}
