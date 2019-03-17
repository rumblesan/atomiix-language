// Copied from OpenObject quark
//
// arrayed osc argument support
// counterpart to asOSCArgBundle, asOSCArgArray

+ SequenceableCollection {

  unfoldOSCArrays {
    var stack, current, prev;

    this.do { |item|
      if(item === $[ /*]*/) {
        current !? { stack = stack.add(current) };
        current = nil;
      } {
        if(item === /*[*/ $]) {
          prev = stack.pop;
          prev = prev.add(current);
          current = prev;
        } {
          current = current.add(item);
        }
      }
    };

    // empty stack, embed unclosed brackets
    stack.reverseDo { |prev|
      prev = prev.add(current);
      current = prev;
    };
    ^current
  }

  // for convenience and clarity.

  foldOSC {
    ^this.asOSCArgArray
  }

  unfoldOSC {
    ^this.unfoldOSCArrays
  }
}

// redFrik 050621
// beatmatching, interpolation, clock synchronisation
// this will adjust tempo to assure downbeat after x seconds

+TempoClock {

  sync {|tempo, secs = 4, resolution = 1|
    var next, time, durCur, durNew, durDif, durAvg, stepsPerBeat, delta, factor, steps, sum, durs, index= 0;
    secs= secs.max(0.03); //saftey and lower jitter limit
    next= this.timeToNextBeat(1);
    time= secs-(this.tempo.reciprocal*next);
    if(time<next, { //jump directly
      this.tempo_(next/secs); //set a high tempo
      this.sched(next, {
        this.tempo_(tempo);
        nil;
      });
    }, { //else interpolate
      this.sched(next, { //offset the thing to next beat
        durCur= this.tempo.reciprocal;
        durNew= tempo.reciprocal;
        durDif= durNew-durCur;
        durAvg= durCur+durNew/2; //average duration for number of steps
        stepsPerBeat= resolution.max(0.001).reciprocal.round;
        steps= (time/durAvg).round*stepsPerBeat;
        delta= stepsPerBeat.reciprocal; //quantized resolution
        durs= Array.series(steps, durCur, durDif/steps);
        sum= durs.sum/stepsPerBeat;
        factor= time/sum;
        this.sched(0, {
          var tmp;
          if(index<steps, {
            tmp= (durs[index]*factor).reciprocal;
            this.tempo_(tmp);
            index= index+1;
            delta;
            }, {
              this.tempo_(tempo);
              nil;
            });
        });
      nil;
      });
    });
  }
}
