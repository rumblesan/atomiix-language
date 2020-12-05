export default {
  parser: {
    commands: {
      sequence: 'future',
      future: 'future',
      group: 'group',
    },
    errors: {
      sequenceUnsupported: 'No support for sequence command yet',
      expectingOpOrModifier:
        'Unexpected token: Expecting operator or score modifier',
      expectingNumberOrString: 'Unexpected token: Expecting number or string',
      expectingAgentName: 'Unexpected token: Expecting agent name',
      nonMatchedScoreDelims: (first, last) =>
        `Score delimiters don't match. Starts with ${first} but ends with ${last}`,
      missingMelodicInstrument: 'Melodic score should have an instrument',
      missingConcreteInstrument: 'Concrete score should have an instrument',
      invalidPercussionBank: name =>
        `${name} is not a valid percussion bank name. Should look like 'bank0', 'midi2', 'bank99'`,
      invalidScoreDelimiter: delim =>
        `${delim} is not a supported score delimiter`,
      nonMatchedScoreModDelims: (first, last) =>
        `Score modifier delimiters don't match. Starts with ${first} but ends with ${last}`,
      invalidChordName: 'Chord names must be single letters',
    },
  },
  interpreter: {
    commands: {
      doze: 'doze',
      wake: 'wake',
      nap: 'nap',
      kill: 'kill',
      scale: 'scale',
      scalepush: 'scalepush',
      tonic: 'tonic',
      tempo: 'tempo',
      shake: 'shake',
      reverse: 'reverse',
      shiftr: 'shiftr',
      shiftl: 'shiftl',
      up: 'up',
      down: 'down',
      yoyo: 'yoyo',
      swap: 'swap',
      order: 'order',
      invert: 'invert',
      replace: 'replace',
      remove: 'remove',
      insert: 'insert',
      expand: 'expand',
      grid: 'grid',
      remind: 'remind',
      dave: 'dave',
    },
    errors: {
      noAgent: name => `No agent called ${name}`,
      noGroup: name => `No group called ${name}`,
      groupExists: name => `${name} is already the name of a group`,
      agentExists: name => `${name} is already the name of an agent`,
      unknownStatement: type => `${type} is not a supported statement type`,
      unknownCommand: name => `${name} is not an existing command`,
      unknownScore: type => `${type} is not a supported score type`,
      expectedMelodic: type => `Expected MELODIC score, not ${type}`,
      unknownScale: (command, name) =>
        `${command} -> ${name} is not a known scale`,
      expectedArgs: (command, num) =>
        `${command} expected at least ${num} arguments`,
      expectedString: (command, type) =>
        `${command} expected String but got ${type}`,
      expectedNum: (command, type) =>
        `${command} expected Number but got ${type}`,
      chordDoesntExist: name => `No chord named ${name}`,
    },
    misc: {
      upper: 'upper',
      lower: 'lower',
    },
  },
};
