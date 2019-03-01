import * as t from '../ast/types';

function OSCMessage(address, args) {
  return {
    oscType: 'message',
    address,
    args,
  };
}

export function programToOSC(program) {
  return program.statements.map(statementToOSC);
}

export function statementToOSC(statement) {
  switch (statement.type) {
    case t.PLAY:
      return playStmtToOSC(statement);
  }
}

export function playStmtToOSC({ agent, pattern }) {
  const { sequence } = pattern;
  const address = '/play/pattern';
  let patternType;
  switch (sequence.seqType) {
    case t.PERCUSSIVE:
      patternType = 'percussive';
      break;
    case t.MELODIC:
      patternType = 'melodic';
      break;
    case t.CONCRETE:
      patternType = 'concrete';
      break;
  }
  const msgArgs = [
    agent.name, // agentName
    patternType, // patternType
    { type: 'array', value: sequence.notes }, // noteArray
    { type: 'array', value: sequence.durations }, // durArray
    { type: 'array', value: [] }, // instrumentArray
    { type: 'array', value: [] }, // sustainArray
    { type: 'array', value: [] }, // attackArray
    { type: 'array', value: [] }, // panArray
    sequence.offset, // quantPhase,
    0, // repeats
    false, // newInstrFlag
  ];
  return OSCMessage(address, msgArgs);
}
