

Atomiix {

	var instruments, sequencer;

	*start {|configPath = "atomiix/", numChannels = 2, server|
		server = server ? Server.default;
		server.waitForBoot {
			Routine.run {
				"Booting Atomiix...".postln;
				~atomiix = Atomiix.new.init(configPath, "default", numChannels);
				"Atomiix-SC: Listening on port %\n".format(NetAddr.langPort).postln;
			}
		};
	}

	init {|configPath, project, numChannels|
		instruments = AtomiixInstr.new(configPath, project, numChannels);
		sequencer = AtomiixSequencer.new(numChannels);
		this.setupOSC();
	}

  setupOSC {
    "Setting up OSC listeners".postln;

    OSCFunc({|msg, time, addr, recvPort|
      var values = msg.unfoldOSC();
      var scoreType = values[1];
      switch (scoreType,
        \percussive, { this.playPercussiveScore(values[2..]) },
        \melodic, { this.playMelodicScore(values[2..]) },
        \concrete, { this.playConcreteScore(values[2..]) },
        { ("unknown score type: " ++ scoreType).postln }
      )
    }, '/play/pattern');
  }

  playPercussiveScore {|scoreData|
		var agentName = scoreData[0];
		var notes = scoreData[1];
		var durations = scoreData[2];
		var instruments = scoreData[3];
		var sustain = scoreData[4];
		var attack = scoreData[5];
		var panning = scoreData[6];
		var offset = scoreData[7];
		var repeats = scoreData[8];
		sequencer.playPercussiveScore(
			agentName, notes, durations, instruments,
			sustain, attack, panning, offset, repeats
		);
  }

  playMelodicScore {|scoreData|
		var agentName = scoreData[0];
		var notes = scoreData[1];
		var durations = scoreData[2];
		var instrument = scoreData[3];
		var sustain = scoreData[4];
		var attack = scoreData[5];
		var panning = scoreData[6];
		var offset = scoreData[7];
		var repeats = scoreData[8];
		sequencer.playMelodicScore(
			agentName, notes, durations, instrument,
			sustain, attack, panning, offset, repeats
		);
  }

  playConcreteScore {|scoreData|
		var agentName = scoreData[0];
		var pitch = scoreData[1];
		var amplitudes = scoreData[2];
		var durations = scoreData[3];
		var instrument = scoreData[3];
		var panning = scoreData[6];
		var offset = scoreData[7];
		var repeats = scoreData[8];
		sequencer.playConcreteScore(
			agentName, pitch, amplitudes, durations,
      instrument, panning, offset, repeats
		);
  }

}
