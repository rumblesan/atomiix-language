(

	s.options.numInputBusChannels = 0;

	s.waitForBoot {
		~atomiix = Atomiix.new.init("atomiix/", "default", 57120, 2);
	}

)
