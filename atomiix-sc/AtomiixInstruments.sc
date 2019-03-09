// Code pulled from Ixilang
// Original courtesy Thor Magnusson and contributors

AtomiixInstruments {

  var configFolder, project;
  var sampleNames;
  var bufferPool;

  init {| configPath, projectName |
    configFolder = configPath;
    project = projectName;
    this.loadProjectSynthDefs();
    this.loadSampleSynthDefs();
    this.makeSynthDefs();
  }

	freeBuffers {
		bufferPool.do({arg buffer; buffer.free;});
	}

  makeInstrDict{
    var instrDict, keyMapPath;

    // if sounds folder contains a key mapping file, then it is used, else,
    // the instrDict is created by mapping random sound files onto the letters
    keyMapPath = configFolder++project++"/keyMapping.ixi";

    if(Object.readArchive(keyMapPath).isNil, {
      instrDict = IdentityDictionary.new;
      [\A, \a, \B, \b, \C, \c, \D, \d, \E, \e, \F, \f, \G, \g, \H, \h, \I, \i,
       \J, \j, \K, \k, \L, \l, \M, \m, \N, \n, \O, \o, \P, \p, \Q, \q, \R, \r,
       \S, \s, \T, \t, \U, \u, \V, \v, \W, \w, \X, \x, \Y, \y, \Z, \z
      ].do({arg letter, i;
        instrDict[letter] = sampleNames.wrapAt(i).asSymbol;
      });
      "No key mappings were found, so samples will be randomly assigned to keys".postln;
    }, {
      instrDict = Object.readArchive(keyMapPath);
    });

    "The keys of your keyboard are mapped to the following samples :".postln;
    Post << this.getSamplesSynthdefs(instrDict);
    if(sampleNames.size == 0, {
      "There were no samples in your samples folder, please put some there!".postln;
    });
    ^instrDict;
  }

  makeEffectDict {
    var effectDict;
    // for your own effects, simply add a new line to here
    effectDict = IdentityDictionary.new;
    effectDict[\reverb]   = {arg sig; (sig*0.6)+FreeVerb.ar(sig, 0.85, 0.86, 0.3)};
    effectDict[\reverbL]   = {arg sig; (sig*0.6)+FreeVerb.ar(sig, 0.95, 0.96, 0.7)};
    effectDict[\reverbS]   = {arg sig; (sig*0.6)+FreeVerb.ar(sig, 0.45, 0.46, 0.2)};
    effectDict[\delay]    = {arg sig; sig + AllpassC.ar(sig, 1, 0.15, 1.3 )};
    effectDict[\lowpass]   = {arg sig; RLPF.ar(sig, 1000, 0.2)};
    effectDict[\tremolo]  = {arg sig; (sig * SinOsc.ar(2.1, 0, 5.44, 0))*0.5};
    effectDict[\vibrato]  = {arg sig; PitchShift.ar(sig, 0.008, SinOsc.ar(2.1, 0, 0.11, 1))};
    effectDict[\techno]   = {arg sig; RLPF.ar(sig, SinOsc.ar(0.1).exprange(880,12000), 0.2)};
    effectDict[\technosaw]   = {arg sig; RLPF.ar(sig, LFSaw.ar(0.2).exprange(880,12000), 0.2)};
    effectDict[\distort]   = {arg sig; (3111.33*sig.distort/(1+(2231.23*sig.abs))).distort*0.02};
    effectDict[\cyberpunk]  = {arg sig; Squiz.ar(sig, 4.5, 5, 0.1)};
    effectDict[\bitcrush]  = {arg sig; Latch.ar(sig, Impulse.ar(11000*0.5)).round(0.5 ** 6.7)};
    effectDict[\antique]  = {arg sig; LPF.ar(sig, 1700) + Dust.ar(7, 0.6)};
    ^effectDict;
  }

  getSamplesSynthdefs {| instrDict |
    var string, sortedkeys, sortedvals;
    sortedkeys = instrDict.keys.asArray.sort;
    sortedvals = instrDict.atAll(instrDict.order);
    string = " ";
    sortedkeys.do({arg item, i;
      string = string++item++"  :  "++sortedvals[i]++"\n"++" ";
    });
    ^string;
  }

  loadProjectSynthDefs {
    // instead of loadPath
    (configFolder++project++"/synthdefs.scd").load;
  }

  loadSampleSynthDefs {
    var sampleFolder, samplePaths, nrOfSampleSynthDefs;
    // here in order to free buffers when doc is closed
    bufferPool = [];

    "Loading samples".postln;

    // ---------------------- sample based instruments ---------------------
    sampleFolder = (configFolder++project++"/samples/*");
    samplePaths = sampleFolder.pathMatch;
    sampleNames = samplePaths.collect({ |path| path.basename.splitext[0]});

    if(samplePaths == [], {
      "-------------------------- NOTE ---------------------------".postln;
      "ixi lang : No samples were found to map to the keys. You need to put samples into the 'samples' folder of your project. (Default project is called 'default', but create your own project by creating a new folder next to the 'default'folder. \nSee the XiiLang.html help file".postln;
      "------------------------------------------------------------".postln;

    }, {

      // there might be more samples in the folder than the 52
      // keys of the keyboard, so load them as well
      nrOfSampleSynthDefs = if(sampleNames.size < 52, {52}, {sampleNames.size});

      // 52 is the number of keys (lower and uppercase letters) supported
      nrOfSampleSynthDefs.do({arg i;
        var file, chnum, filepath;
        filepath = samplePaths.wrapAt(i);
        file = SoundFile.new;
        file.openRead(filepath);
        chnum = file.numChannels;
        file.close;
        SynthDef(sampleNames.wrapAt(i).asSymbol, {arg out=0, freq=261.63, amp=0.3, pan=0, noteamp=1, sustain=0.4;
          var buffer, player, env, signal, killer;
          bufferPool = bufferPool.add(buffer = Buffer.read(Server.default, filepath));
          player = Select.ar(noteamp, [
            // playMode 2 - the sample player mode
            if(chnum==1, {
              LoopBuf.ar(1, buffer, (freq.cpsmidi-60).midiratio, 1, 0, 0, 44100*60*10)
            }, {
              LoopBuf.ar(2, buffer, (freq.cpsmidi-60).midiratio, 1, 0, 0, 44100*60*10).sum
            }) * EnvGen.ar(Env.linen(0.0001, 60*60, 0.0001))
            , // playMode 1 - the rhythmic mode
            if(chnum==1, {
              PlayBuf.ar(1, buffer, (freq.cpsmidi-60).midiratio)
            }, {
              PlayBuf.ar(2, buffer, (freq.cpsmidi-60).midiratio).sum
            }) * EnvGen.ar(Env.perc(0.01, sustain))
          ]);

          // I use DetectSilence rather than doneAction in Env.perc, as a
          // doneAction in Env.perc would also be running (in Select) thus
          // killing the synth even in {} mode I therefore add 0.02 so the
          DetectSilence.ar(player, 0.001, 0.5, 2);
          // works better without lag
          signal = player * amp * noteamp;
          Out.ar(out, Pan2.ar(signal, pan));
        }).add;
      });

    });
  }

  makeSynthDefs {

    // ---------------------- synthesized instruments -----------------------------
    "Loading default synths".postln;

    SynthDef(\impulse, { arg out=0, gate=1, pan=0, amp=1;
      var x, imp, killenv;
      killenv = EnvGen.ar(Env.adsr(0.0000001, 1, 0.2), gate, doneAction:2);
      imp = Impulse.ar(1);
      x = Pan2.ar(imp * EnvGen.ar(Env.perc(0.0000001, 0.2)), pan) * amp;
      Out.ar(out, LeakDC.ar(Limiter.ar(x)));
    }).add;

    SynthDef(\kick,{ arg out=0, pan=0, amp=0.3, mod_freq = 2.6, mod_index = 5, sustain = 0.4, beater_noise_level = 0.025;
      var pitch_contour, drum_osc, drum_lpf, drum_env;
      var beater_source, beater_hpf, beater_lpf, lpf_cutoff_contour, beater_env;
      var kick_mix, freq = 80;
      pitch_contour = Line.kr(freq*2, freq, 0.02);
      drum_osc = PMOsc.ar(pitch_contour, mod_freq, mod_index/1.3, mul: 1, add: 0);
      drum_lpf = LPF.ar(in: drum_osc, freq: 1000, mul: 1, add: 0);
      drum_env = drum_lpf * EnvGen.ar(Env.perc(0.005, sustain), 1.0, doneAction: 2);
      beater_source = WhiteNoise.ar(beater_noise_level);
      beater_hpf = HPF.ar(in: beater_source, freq: 500, mul: 1, add: 0);
      lpf_cutoff_contour = Line.kr(6000, 500, 0.03);
      beater_lpf = LPF.ar(in: beater_hpf, freq: lpf_cutoff_contour, mul: 1, add: 0);
      beater_env = beater_lpf * EnvGen.ar(Env.perc(0.000001, 1), doneAction: 2);
      kick_mix = Mix.new([drum_env, beater_env]) * 2 * amp;
      Out.ar(out, Pan2.ar(kick_mix, pan))
    }).add;

    SynthDef(\kick2, {  arg out=0, amp=0.3, sustain=0.26, pan=0;
      var env0, env1, env1m, son;

      env0 =  EnvGen.ar(Env.new([0.5, 1, 0.5, 0], [0.005, 0.06, sustain], [-4, -2, -4]), doneAction:2);
      env1 = EnvGen.ar(Env.new([110, 59, 29], [0.005, 0.29], [-4, -5]));
      env1m = env1.midicps;

      son = LFPulse.ar(env1m, 0, 0.5, 1, -0.5) + WhiteNoise.ar(1);
      son = LPF.ar(son, env1m*1.5, env0);
      son = son + SinOsc.ar(env1m, 0.5, env0);

      son = son * 1.2;
      son = son.clip2(1);

      Out.ar(out, Pan2.ar(son * amp, pan));
    }).add;

    SynthDef(\kick3, { arg out=0, amp=0.3, pan=0, dur=0.35, high=150, sustain = 0.4, low=33, phase=1.5;
      var signal;
      signal = SinOsc.ar(XLine.kr(high, low, dur), phase*pi, amp);
      //signal = signal * EnvGen.ar(Env.new([1,0],[dur]), gate, doneAction:2);
      signal = signal * EnvGen.ar(Env.perc(0.0001, sustain), doneAction:2);
      Out.ar(out, Pan2.ar(signal, pan));
    }).add;

    SynthDef(\snare, {arg out=0, amp=0.3, pan=0, sustain = 0.04, drum_mode_level = 0.15,
      snare_level = 50, snare_tightness = 1200, freq = 305;
      var drum_mode_sin_1, drum_mode_sin_2, drum_mode_pmosc, drum_mode_mix, drum_mode_env;
      var snare_noise, snare_brf_1, snare_brf_2, snare_brf_3, snare_brf_4, snare_reson;
      var snare_env, snare_drum_mix;

      drum_mode_env = EnvGen.ar(Env.perc(0.005, sustain), doneAction: 2);
      drum_mode_sin_1 = SinOsc.ar(freq*0.53, 0, drum_mode_env * 0.5);
      drum_mode_sin_2 = SinOsc.ar(freq, 0, drum_mode_env * 0.5);
      drum_mode_pmosc = PMOsc.ar( Saw.ar(freq*0.85),
        184,
        0.5/1.3,
        mul: drum_mode_env*5,
        add: 0);
      drum_mode_mix = Mix.new([drum_mode_sin_1, drum_mode_sin_2, drum_mode_pmosc]) * drum_mode_level;
      // choose either noise source below
      //  snare_noise = WhiteNoise.ar(amp);
      snare_noise = LFNoise0.ar(9000, amp*0.8); // play with the frequency here
      snare_env = EnvGen.ar(Env.perc(0.0001, sustain), doneAction: 2);
      snare_brf_1 = BRF.ar(in: snare_noise, freq: 8000, mul: 0.5, rq: 0.1);
      snare_brf_2 = BRF.ar(in: snare_brf_1, freq: 5000, mul: 0.5, rq: 0.1);
      snare_brf_3 = BRF.ar(in: snare_brf_2, freq: 3600, mul: 0.5, rq: 0.1);
      snare_brf_4 = BRF.ar(in: snare_brf_3, freq: 2000, mul: snare_env, rq: 0.1);
      snare_reson = Resonz.ar(snare_brf_4, snare_tightness, mul: snare_level) ;
      snare_drum_mix = Mix.new([drum_mode_mix, snare_reson]) * amp;
      Out.ar(out, Pan2.ar(snare_drum_mix, 0))
    }).add;

    SynthDef(\brushsnare, {|out= 0, bpfreq= 5000, amp= 1, pan= 0|
      var env, noise;
      env = EnvGen.kr(Env.perc(0.001, 0.1), 1, amp, doneAction:2);
      noise = BPF.ar(PinkNoise.ar(3), bpfreq * (env*8.5));
      Out.ar(out, Pan2.ar(noise*env, pan));
    }).add;

    SynthDef(\bar, {arg out = 0, pan=0, freq = 6000, sustain = 0.2, amp=0.3;
      var root_cymbal, root_cymbal_square, root_cymbal_pmosc;
      var initial_bpf_contour, initial_bpf, initial_env;
      var body_hpf, body_env;
      var cymbal_mix;

      root_cymbal_square = Pulse.ar(freq, 0.5, mul: 0.81);
      root_cymbal_pmosc = PMOsc.ar(root_cymbal_square, [freq*1.34, freq*2.405, freq*3.09, freq*1.309], [310/1.3, 26/0.5, 11/3.4, 0.72772], mul: 1, add: 0);
      root_cymbal = Mix.new(root_cymbal_pmosc);
      initial_bpf_contour = Line.kr(15000, 9000, 0.1);
      initial_env = EnvGen.ar(Env.perc(0.005, 0.1), 1.0);
      initial_bpf = BPF.ar(root_cymbal, initial_bpf_contour, mul:initial_env);
      body_env = EnvGen.ar(Env.perc(0.005, sustain, 1, -2), doneAction: 2);
      body_hpf = HPF.ar(in: root_cymbal, freq: Line.kr(9000, 12000, sustain),mul: body_env, add: 0);
      cymbal_mix = Mix.new([initial_bpf, body_hpf]) * amp;
      Out.ar(out, Pan2.ar(cymbal_mix, pan))
    }).add;

    SynthDef(\clap, {arg out=0, pan=0, amp=0.3, filterfreq=50, rq=0.01;
      var env, signal, attack,Ê noise, hpf1, hpf2;
      noise = WhiteNoise.ar(1)+SinOsc.ar([filterfreq/2,filterfreq/2+4 ], pi*0.5, XLine.kr(1,0.01,4));
      //noise = PinkNoise.ar(1)+SinOsc.ar([(filterfreq)*XLine.kr(1,0.01,3), (filterfreq+4)*XLine.kr(1,0.01,3) ], pi*0.5, XLine.kr(1,0.01,4));
      //signal = signal * SinOsc.ar(1,0.75);
      hpf1 = RLPF.ar(noise, filterfreq, rq);
      hpf2 = RHPF.ar(noise, filterfreq/2, rq/4);
      env = EnvGen.kr(Env.perc(0.003, 0.00035));
      signal = (hpf1+hpf2) * env;
      signal = CombC.ar(signal, 0.5, 0.03, 0.031)+CombC.ar(signal, 0.5, 0.03016, 0.06);
      //signal = Decay2.ar(signal, 0.5);
      signal = FreeVerb.ar(signal, 0.23, 0.15, 0.2);
      Out.ar(out, Pan2.ar(signal * amp, pan));
      DetectSilence.ar(signal, doneAction:2);
    }).add;

    SynthDef(\hat, { arg out=0, pan=0, amp=0.3;
      var sig;
      // a release gate
      EnvGen.ar(Env.perc(0.00001, 2), doneAction: 2);
      // the other env has problem with gate
      // (i.e. FAILURE n_set Node not found)
      sig = WhiteNoise.ar(amp) * EnvGen.ar(Env.perc(0.00001, 0.01));
      Out.ar(out, Pan2.ar(sig, pan));
    }).add;

    // ----------------------------------------------------------------------------------
    // ------------------------------- melodic instruments  -----------------------------
    // ----------------------------------------------------------------------------------

    /*
    // a pattern to test the instruments
    Pdef(\test, Pbind(\instrument, \clap, \midinote, Prand([1, 2, 5, 7, 9, 3], inf) + 60, \dur, 0.8)).play;
    */

    SynthDef(\whistle, {arg out=0, freq=130.8128, gate=1, amp=0.3, dur=1, pan=0;
      var signal, env;
      env = EnvGen.ar(Env.asr(0.01, 1, 0.2), gate, doneAction:2);
      signal = GVerb.ar(SyncSaw.ar(freq, XLine.ar(freq*2, freq*4, dur/2), amp*0.1));
      signal = signal + LPF.ar(PinkNoise.ar(amp), XLine.ar(60.midicps, 72.midicps, dur/2));
      Out.ar(out, Balance2.ar(signal[0], signal[1], pan, env*amp));
    }).add;

    SynthDef(\dubbass, {arg out=0, freq=440, dur=1, gate=1, amp=0.3, target=8, pan=0;
      var saw, env;
      saw = SyncSaw.ar([freq, freq+1], [Line.ar(freq, freq*target, dur+0.2), Line.ar(freq, freq*target, dur+0.2)+1], amp);
      saw = RLPF.ar(saw, XLine.ar(freq*4, freq*9, dur), XLine.ar(0.9, 0.1, dur));
      env = EnvGen.ar(Env.asr(0.01, 1, 0.2), gate, doneAction:2);
      Out.ar(out, Balance2.ar(saw[0], saw[1], pan, env*amp)); // should really use an env here, but it sound cool without it
    }).add;

    SynthDef(\bengaX, {arg out=0, freq=440, dur=1, gate=1, amp=0.3, pan=0;
      var saw, filter, env;
      saw = SinOsc.ar([1, 1.01]*SinOsc.ar(223).range(freq/4, freq/2), amp)+LPF.ar(Saw.ar([freq, freq+1]/2, 1), SinOsc.ar(5).range(freq, freq*3))+LPF.ar(Saw.ar([freq, freq+1]/4, amp), LFNoise2.ar(3).range(freq, freq*3));
      filter = MoogFF.ar(saw, freq*22, 1);
      env = EnvGen.ar(Env.asr(0.01, amp, 0.2), gate, doneAction:2);
      Out.ar(out, Balance2.ar(saw[0], saw[1], pan, env));
    }).add;

    SynthDef(\dubpad, {arg out=0, freq=220, gate=1, amp=0.3, pan=0;
      var wave, amps, env;
      amps = [0.6134, 0.5103, 0.3041, 0.2216, 0.4175, 0.1082, 0.067, 0.0773, 0, 0.01546];
      wave = amps.collect({|amp, i| SinOsc.ar([freq *(i+1), freq *(i+1) +Rand(1, 3.8)], 0, amp*0.1) }).sum;
      env = EnvGen.ar(Env.asr(0.01, 1, 0.2), gate, doneAction:2);
      Out.ar(out, Balance2.ar(wave[0], wave[1], pan, amp*env));
    }).add;

    SynthDef(\dubchordpad, {arg out=0, freq=220, gate=1, amp=0.3, pan=0;
      var wave1, wave2, wave3, amps, env;
      amps = [0.6134, 0.5103, 0.3041, 0.2216, 0.4175, 0.1082, 0.067, 0.0773, 0, 0.01546];
      wave1 = amps.collect({|amp, i| SinOsc.ar([freq *(i+1), freq *(i+1) +Rand(1, 3.8)], 0, amp*0.1) }).sum;
      wave2 = amps.collect({|amp, i| SinOsc.ar([freq*1.1892 *(i+1), freq*1.1892 *(i+1) +Rand(1, 3.8)], 0, amp*0.1) }).sum;
      wave3 = amps.collect({|amp, i| SinOsc.ar([freq*1.5 *(i+1), freq*1.5 *(i+1) +Rand(1, 3.8)], 0, amp*0.1) }).sum;
      env = EnvGen.ar(Env.asr(0.01, 1, 0.2), gate, doneAction:2);
      Out.ar(out, Balance2.ar((wave1+wave2+wave3)[0], (wave1+wave2+wave3)[1], pan, amp*env));
    }).add;

    SynthDef(\deepdubsynth, {arg out=0, freq=220, amp=0.1, dur=1, gate=1, tmp=2, pan=0;
      var trig, note, son, sweep, bassenv, bd, sd, swr;
      var midinote, unienv;
      ÊÊÊ trig = Impulse.kr(tmp);

      midinote = freq.cpsmidi/2;

      note = Demand.kr(trig, 0, Dxrand([midinote, midinote+(Rand(10)/10).round, midinote+(Rand(30)/10).round, midinote+(Rand(40)/10).round, midinote+(Rand(30)/10).round].midicps, inf));
      swr = Demand.kr(trig, 0, Drand([0.5, 1, 2, 3, 4, 6], inf));

      sweep = LFTri.ar(swr).exprange(140, 10000);
      //x = LFNoise2.ar(swr).exprange(140, 10000);
      son = LFSaw.ar(note *[0.99, 1, 1.01] ).sum;
      son = LPF.ar(son, sweep);
      son = son.sin.tanh;
      //  y = Saw.ar(note *[0.99, 1, 1.01] ).sum;
      //  y = RLPF.ar(son, x, MouseX.kr(0.1, 0.9));
      //  son+y
      unienv = EnvGen.ar(Env.asr(0.01, amp*0.4, 0.2), gate, doneAction:2);
      Out.ar(out, Pan2.ar(unienv*son, pan));
    }).add;

    SynthDef(\casp, {arg out=0, freq=220, amp=0.1, dur=1, gate=1, pan=0;
      var son, unienv;
      son = Pulse.ar(freq * [1, 1.01], 0.5 , amp).sum + Pulse.ar(freq * [1, 1.01] *0.5, 0.5, 0.2 ).sum;
      //son = RLPF.ar(son, freq*10, 0.01);
      unienv = EnvGen.ar(Env.asr(0.01, amp*0.3, 0.2), gate, doneAction:2);
      Out.ar(out, Pan2.ar(unienv*son, pan));
    }).add;

    SynthDef(\caspRLPF, {arg out=0, freq=220, amp=0.1, dur=1, gate=1, pan=0;
      var son, unienv;
      son = Pulse.ar(freq * [1, 1.01], 0.5, amp ).sum + Pulse.ar(freq * [1, 1.01] *0.5, 0.5, 0.2 ).sum;
      son = RLPF.ar(son, freq*10, 0.01);
      unienv = EnvGen.ar(Env.asr(0.01, amp*0.3, 0.2), gate, doneAction:2);
      Out.ar(out, Pan2.ar(unienv*son, 0));
    }).add;


    SynthDef(\cling, {arg out=0, amp=0.3, sustain=0.3, pan=0;
      var signal, env;
      env = EnvGen.ar(Env.perc(0.000001, sustain), doneAction:2);
      signal = SinOsc.ar(3000).squared;
      Out.ar(out, Pan2.ar(signal*env, pan, amp));
    }).add;

    SynthDef(\cling2, {arg out=0, amp=0.3, sustain=0.5, pan=0;
      var signal, env;
      env = EnvGen.ar(Env.perc(0.000001, sustain), doneAction:2);
      signal = LFSaw.ar(2000).squared;
      Out.ar(out, Pan2.ar(signal*env, pan, amp));
    }).add;

    SynthDef(\flute, { arg out=0, scl=0.2, freq=440, ipress=0.9, ibreath=0.09, ifeedbk1=0.4, ifeedbk2=0.4, sustain=0.15, gate=1, amp=1, pan=0;
      var kenv1, kenv2, kenvibr, kvibr, sr, cr, block;
      var poly, signalOut, ifqc;
      var aflow1, asum1, asum2, afqc, atemp1, ax, apoly, asum3, avalue, atemp2, aflute1;
      var fdbckArray;

      sr = SampleRate.ir;
      cr = ControlRate.ir;
      block = cr.reciprocal;
      ifqc = freq;
      // noise envelope
      kenv1 = EnvGen.kr(Env.new(
        [ 0.0, 1.1 * ipress, ipress, ipress, 0.0 ], [ 0.06, 0.2, 8 - 0.46, 0.2 ], 'linear' )
      );
      kenv2 = EnvGen.kr(Env.adsr(0.0001, 0.1, 1, 0.3), gate, doneAction:2);

      // overall envelope
      // kenv2 = EnvGen.kr(Env.new(
      //   [ 0.0, amp, amp, 0.0 ], [ 0.1, sustain - 0.02, 0.1 ], 'linear' ), doneAction: 2
      // );

      // vibrato envelope
      kenvibr = EnvGen.kr(Env.new( [ 0.0, 0.0, 1, 1, 0.0 ], [ 0.5, 0.5, 8 - 1.5, 0.5 ], 'linear') );
      // create air flow and vibrato
      aflow1 = LFClipNoise.ar( sr, kenv1 );
      kvibr = SinOsc.ar( 5, 0, 0.1 * kenvibr );
      asum1 = ( ibreath * aflow1 ) + kenv1 + kvibr;
      afqc = ifqc.reciprocal - ( asum1/20000 ) - ( 9/sr ) + ( ifqc/12000000 ) - block;
      fdbckArray = LocalIn.ar( 1 );
      aflute1 = fdbckArray;
      asum2 = asum1 + ( aflute1 * ifeedbk1 );
      //ax = DelayL.ar( asum2, ifqc.reciprocal * 0.5, afqc * 0.5 );
      ax = DelayC.ar( asum2, ifqc.reciprocal - block * 0.5, afqc * 0.5 - ( asum1/ifqc/cr ) + 0.001 );
      apoly = ax - ( ax.cubed );
      asum3 = apoly + ( aflute1 * ifeedbk2 );
      avalue = LPF.ar( asum3, 2000 );
      aflute1 = DelayC.ar( avalue, ifqc.reciprocal - block, afqc );
      fdbckArray = [ aflute1 ];
      LocalOut.ar( fdbckArray );
      signalOut = avalue * amp;
      OffsetOut.ar(out, Pan2.ar(signalOut * kenv2, 0) );
    }).add;

    // ---------------------- synthesized instruments -----------------------------
    // a crappy synth as to yet
    SynthDef(\fmsynth, {|out=0, freq=440, carPartial=1, modPartial=1.5, index=13, gate=1, amp=0.3, pan=0|
      var mod, car, env;
      // modulator frequency
      mod = SinOsc.ar(freq * modPartial, 0, freq * index );
      // carrier frequency
      car = SinOsc.ar((freq * carPartial) + mod, 0, amp );
      // envelope
      env = EnvGen.kr(Env.adsr, gate, doneAction:2);
      Out.ar( out, Pan2.ar(car * env * amp, pan))
    }).add;

    SynthDef(\bling, { arg out=0, pan=0, amp=0.3, sustain=0.5, freq=999;
      var x, y, env, imp;
      env = Env.perc(0.0000001, sustain*2);
      imp = Impulse.ar(1);
      imp = Decay2.ar(imp, 0.01, 0.5, MoogFF.ar(VarSaw.ar(freq, 0.8, 0.5), freq*12, 3.6) );
      x = Pan2.ar(imp * EnvGen.ar(env, doneAction:2), pan) * amp*4;
      Out.ar(out, LeakDC.ar(x));
    }).add;

    SynthDef(\bass, {arg out, freq=220, gate=1, sustain=0.3, amp=0.3, pan=0;
      var env, signal;
      env = EnvGen.ar(Env.adsr(0.01, sustain, sustain/2, 0.3), gate, doneAction:2);
      signal = MoogFF.ar(Saw.ar([freq/2, (freq/2)+0.8],  amp*2), freq*2, 3.4) * env;
      Out.ar(out, Balance2.ar(signal[0], signal[1], pan, env));
    }).add;

    SynthDef(\moog, {arg out=0, freq=220, amp=0.3, sustain=0.3, gate=1, pan=0;
      var signal;
      var env = EnvGen.kr(Env.adsr(0.01, 0.2, amp*0.8, 0.3), gate, doneAction:2);
      signal = MoogFF.ar(Saw.ar([freq, freq+2], 1), 7*freq, 3.3) * env;
      Out.ar(out, Balance2.ar(signal[0], signal[1], pan));
    }).add;

    SynthDef(\bell, {arg out=0, freq=440, sustain=0.5, amp=0.3, pan=0;
      var x, in, env;
      env = EnvGen.kr(Env.perc(0.01, sustain*Rand(333, 666)/freq), doneAction:2);
      x = Mix.ar([SinOsc.ar(freq, 0, 0.11), SinOsc.ar(freq*2, 0, 0.09)] ++
        Array.fill(6, {SinOsc.ar(freq*Rand(-5,5).round(0.125), 0, Rand(0.02,0.1))}));
      //x = BPF.ar(x, freq, 4.91);
      Out.ar(out, Pan2.ar(x*env*amp, pan));
    }).add;

    // rubbish! MdaPiano does not support microtonality !!!
    SynthDef(\piano, { |out=0, freq=440, gate=1, sustain = 0.9, amp=0.3, pan=0|
      var sig = MdaPiano.ar(freq, gate, decay:(sustain*2), release: (sustain*6), stereo: 0.3, sustain: 0);
      var env = EnvGen.kr(Env.adsr(0.01, sustain*4, sustain*2, 0.3), gate, doneAction:2);
      Out.ar(out, Balance2.ar(sig[0], sig[1], pan, (amp*0.35)*env));
    }).add;

    SynthDef(\clarinet, { |out=0, freq=440, gate=1, sustain=0.3, amp=0.3, pan=0|
      var sig = StkClarinet.ar(freq, 44, 2, 77, 2, 88);
      var env = EnvGen.kr(Env.adsr(0.01, sustain, sustain/2, 0.3), gate, doneAction:2);
      Out.ar(out, Pan2.ar(sig * env * amp * 0.6, pan) );
    }).add;

    SynthDef(\noise, {arg out=0, freq=440, amp=0.3, sustain=0.3, pan=0, gate=1;
      var signal, env;
      env = EnvGen.kr(Env.adsr(0.01, sustain, 1, 0.3), gate, doneAction:2);
      signal = BPF.ar(PinkNoise.ar(1), freq, 0.008, 100);
      Out.ar(out, Pan2.ar(signal*env, pan, amp));
    }).add;

    SynthDef(\fmbass, {arg out=0, freq=440, amp=0.3, sustain=0.3, pan=0, gate=1;
      var signal, env;
      env = EnvGen.kr(Env.adsr(0.01, sustain, 1, 0.3), gate, doneAction:2);
      signal = SinOsc.ar(SinOsc.ar(freq*0.5, 0, 500*XLine.kr(0.5, 1, sustain)));
      Out.ar(out, Pan2.ar(signal*env, pan, amp));
    }).add;

    SynthDef(\klang, {arg out=0, amp=0.3, t_trig=1, sustain=0.4, freq=100, gate=1, rq=0.004, pan=0;
      var env, signal;
      var rho, theta, b1, b2;
      env = EnvGen.kr(Env.adsr(0.01, sustain, sustain/2, 0.3), gate, doneAction:2);
      b1 = 2.0 * 0.97576 * cos(0.161447);
      b2 = 0.9757.squared.neg;
      signal = SOS.ar(K2A.ar(t_trig), 1.0, 0.0, 0.0, b1, b2);
      signal = RHPF.ar(signal, freq, rq);
      signal = Decay2.ar(signal, 0.4, 0.8, signal);
      signal = Limiter.ar(Resonz.ar(signal, freq, rq*0.5), 0.9);
      Out.ar(out, Pan2.ar((signal*env)*(amp*6), pan));
    }).add;

    SynthDef(\elbass, {arg out=0, amp=0.3, t_trig=1, sustain=0.5, freq=100, gate=1, rq=0.004, pan=0;
      var env, signal;
      var rho, theta, b1, b2;
      env = EnvGen.kr(Env.adsr(0.0001, sustain, sustain/2, 0.3), gate, doneAction:2);
      b1 = 1.98 * 0.989999999 * cos(0.09);
      b2 = 0.998057.neg;
      signal = SOS.ar(K2A.ar(t_trig), 0.123, 0.0, 0.0, b1, b2);
      signal = RHPF.ar(signal, freq, rq) + RHPF.ar(signal, freq*0.5, rq);
      signal = Decay2.ar(signal, 0.4, 0.3, signal);
      Out.ar(out, Pan2.ar((signal*env)*(amp*0.65), 0));
    }).add;

    SynthDef(\marimba, {arg out=0, amp=0.3, t_trig=1, sustain=0.5, gate=1, freq=100, rq=0.006, pan=0;
      var env, signal;
      var rho, theta, b1, b2;
      env = EnvGen.kr(Env.adsr(0.0001, sustain, sustain/2, 0.3), gate, doneAction:2);
      b1 = 1.987 * 0.9889999999 * cos(0.09);
      b2 = 0.998057.neg;
      signal = SOS.ar(K2A.ar(t_trig), 0.3, 0.0, 0.0, b1, b2);
      signal = RHPF.ar(signal*0.8, freq, rq) + DelayC.ar(RHPF.ar(signal*0.9, freq*0.99999, rq*0.999), 0.02, 0.01223);
      signal = Decay2.ar(signal, 0.4, 0.3, signal);
      Out.ar(out, Pan2.ar((signal*env)*(amp*0.65), pan));
    }).add;

    SynthDef(\marimba2, {arg out=0, amp=0.3, t_trig=1, freq=100, sustain=0.5, gate=1, rq=0.006, pan=0;
      var env, signal;
      var rho, theta, b1, b2;
      env = EnvGen.kr(Env.adsr(0.0001, sustain, sustain/2, 0.3), gate, doneAction:2);
      b1 = 1.987 * 0.9889999999 * cos(0.09);
      b2 = 0.998057.neg;
      signal = SOS.ar(K2A.ar(t_trig), 0.3, 0.0, 0.0, b1, b2);
      signal = RHPF.ar(signal*0.8, freq, rq) + DelayC.ar(RHPF.ar(signal*0.9, freq*0.99999, rq*0.999), 0.02, 0.018223);
      //signal = Decay2.ar(signal, 0.4, 0.3, signal);
      signal = Decay2.ar(signal, 0.4, 0.3, signal*SinOsc.ar(freq)); // modulating
      Out.ar(out, Pan2.ar((signal*env)*(amp*0.65), pan));
    }).add;

    SynthDef(\wood, {arg out=0, amp=0.3, pan=0, sustain=0.5, t_trig=1, freq=100, rq=0.06;
      var env, signal;
      var rho, theta, b1, b2;
      b1 = 2.0 * 0.97576 * cos(0.161447);
      b2 = 0.9757.squared.neg;
      signal = SOS.ar(K2A.ar(t_trig), 1.0, 0.0, 0.0, b1, b2);
      //signal = RHPF.ar(signal, freq, rq);
      signal = Decay2.ar(signal, 0.4, 0.8, signal);
      signal = Limiter.ar(Resonz.ar(signal, freq, rq*0.5), 0.9);
      env = EnvGen.kr(Env.perc(0.00001, sustain, amp), doneAction:2);
      Out.ar(out, Pan2.ar(signal, pan)*env);
    }).add;

    SynthDef(\xylo, { |out=0, freq=440, gate=1, amp=0.3, sustain=0.5, pan=0|
      var sig = StkBandedWG.ar(freq, instr:1, mul:3);
      var env = EnvGen.kr(Env.adsr(0.0001, sustain, sustain, 0.3), gate, doneAction:2);
      Out.ar(out, Pan2.ar(sig, pan, env * amp));
    }).add;

    SynthDef(\softwg, { |out=0, freq=440, gate=1, amp=0.3, sustain=0.5, pan=0|
      var sig = StkBandedWG.ar(freq, instr:1, mul:3);
      var env = EnvGen.kr(Env.adsr(0.0001, sustain, sustain, 0.3), gate, doneAction:2);
      Out.ar(out, Pan2.ar(sig, pan, env*amp));
    }).add;

    SynthDef(\sines, {arg out=0, freq=440, dur=1, sustain=0.5, amp=0.3, pan=0;
      var x, env;
      env = EnvGen.kr(Env.perc(0.01, sustain, amp), doneAction:2);
      x = Mix.ar(Array.fill(8, {SinOsc.ar(freq*IRand(1,10),0, 0.08)}));
      x = LPF.ar(x, 20000);
      x = Pan2.ar(x, pan);
      Out.ar(out, x*env);
    }).add;

    SynthDef(\synth, {arg out=0, freq=440, dur=1, sustain=0.5, amp=0.3, pan=0, gate=1;
      var x, env;
      env = EnvGen.kr(Env.adsr(0.0001, sustain, sustain*0.8, 0.3), gate, doneAction:2);
      x = Mix.ar([FSinOsc.ar(freq, pi/2, 0.5), Pulse.ar(freq, Rand(0.3,0.5), 0.5)]);
      x = LPF.ar(x, 20000);
      x = Pan2.ar(x, pan);
      Out.ar(out, LeakDC.ar(x)*env*amp*0.8);
    }).add;

    SynthDef(\string, {arg out=0, freq=440, pan=0, sustain=0.5, amp=0.3;
      var pluck, period, string;
      pluck = PinkNoise.ar(Decay.kr(Impulse.kr(0.005), 0.05));
      period = freq.reciprocal;
      string = CombL.ar(pluck, period, period, sustain*6);
      string = LeakDC.ar(LPF.ar(Pan2.ar(string, pan), 12000)) * amp;
      DetectSilence.ar(string, doneAction:2);
      Out.ar(out, string)
    }).add;

    SynthDef(\drop, {arg out=0, freq=440, dur=1, amp=0.3, sustain=0.5, pan=0;
      var x, env;
      env = EnvGen.kr(Env.perc(0.001, sustain*1.5), doneAction:2);
      x = Resonz.ar(PinkNoise.ar(1), freq*4, 0.005);
      x = Pan2.ar(x,pan);
      Out.ar(out, LeakDC.ar(x)*env*amp*70);
    }).add;

    SynthDef(\crackle, {arg out=0, freq=440, dur=1, sustain=0.5, amp=0.3, pan=0;
      var x, env;
      env = EnvGen.kr(Env.perc(0.01, sustain), doneAction:2);
      x = Resonz.ar(Crackle.ar(1.95, 2), freq*4, 0.1);
      x = Pan2.ar(x,pan);
      Out.ar(out, LeakDC.ar(x)*env*amp*8);
    }).add;

    SynthDef(\glass, {arg out=0, freq=440, dur=1, sustain=0.5, amp=0.3, pan=0;
      var x, env;
      env = EnvGen.kr(Env.perc(0.0001, sustain*4), doneAction:2);
      x = Decay2.ar(Resonz.ar(Impulse.ar(0.01), freq*4, 0.005), 0.001, sustain*2, 3);
      x = Pan2.ar(x,pan);
      Out.ar(out, LeakDC.ar(x)*env*amp*50);
    }).add;

    SynthDef(\sine, {arg out=0, gate=1, freq=440, dur=1, sustain=0.5, amp=0.3, pan=0;
      var env = EnvGen.kr(Env.adsr(0.0001, sustain, sustain/2, 0.3), gate, doneAction:2);
      Out.ar(out, Pan2.ar(SinOsc.ar(freq), pan, env * amp));
    }).add;
  }

}
