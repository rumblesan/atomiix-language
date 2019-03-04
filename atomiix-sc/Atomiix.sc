

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
		var ptype = values[0];
		var agentName = values[1];
		var notes = values[2];
		var durations = values[3];
		var instruments = values[4];
		var sustain = values[5];
		var attack = values[6];
		var panning = values[7];
		var offset = values[8];
		var repeats = values[9];
		this.sequencer.playPercussionScore(
			agentName, notes, durations, instruments,
			sustain, attack, panning, offset, repeats
		);
    }, '/play/pattern');
  }

}
