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

export function playStmtToOSC({ agent, score }) {
  const address = '/play/pattern';
  let patternType;
  switch (score.scoreType) {
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
  const repeats =
    score.repeats === 'inf'
      ? { type: 'bang' }
      : { type: 'integer', value: score.repeats };
  const msgArgs = [
    agent.name, // agentName
    patternType, // patternType
    { type: 'array', value: score.notes }, // noteArray
    { type: 'array', value: score.durations }, // durArray
    { type: 'array', value: score.instruments }, // instrumentArray
    { type: 'array', value: score.sustain }, // sustainArray
    { type: 'array', value: score.attack }, // attackArray
    { type: 'array', value: score.panning }, // panArray
    score.offset, // quantPhase,
    repeats, // repeats
  ];
  return OSCMessage(address, msgArgs);
}
