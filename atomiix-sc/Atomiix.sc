

Atomiix {

	var instruments;

	*start {|numChannels = 2, server|
		server = server ? Server.default;
		server.waitForBoot {
			Routine.run {
				"Booting Atomiix...".postln;
				~atomiix = Atomiix("default", numChannels);
				"Atomiix-SC: Listening on port %\n".format(NetAddr.langPort).postln;
			}
		};
	}

	init {| projectName, numChannels |
		instruments = this.loadInstruments(projectName, numChannels);
	}

	loadInstruments {|projectName, numChannels |
		^AtomiixInstr.new(projectName, numChannels)
	}

}
