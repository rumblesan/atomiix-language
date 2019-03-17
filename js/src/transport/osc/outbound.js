import * as t from '../../ast/types';

export function OSCMessage(address, args) {
  return {
    type: 'OSCMESSAGE',
    oscType: 'message',
    address,
    args,
  };
}

export function agentMethodToOSC(address, method, agentName) {
  const msgArgs = [
    { type: 'string', value: method },
    { type: 'string', value: agentName },
  ];
  return OSCMessage(address, msgArgs);
}

export function freeAgentToOSC(address, agentName) {
  const msgArgs = [
    { type: 'string', value: 'free' },
    { type: 'string', value: agentName },
  ];
  return OSCMessage(address, msgArgs);
}

export function fxChainToOSC(address, agent, effects) {
  const msgArgs = [
    { type: 'string', value: agent.name },
    { type: 'array', value: effects.map(e => e.name) },
  ];
  return OSCMessage(address, msgArgs);
}

export function ampChangeToOSC(address, agent, change) {
  const msgArgs = [
    { type: 'string', value: agent.name },
    { type: 'float', value: change },
  ];
  return OSCMessage(address, msgArgs);
}

export function tempoChangeToOSC(address, tempo, glide) {
  const msgArgs = [{ type: 'float', value: tempo }];
  if (glide) {
    msgArgs.push({ type: 'float', value: glide });
  }
  return OSCMessage(address, msgArgs);
}

export function futureCallbackOSC(
  address,
  time,
  timeType,
  repeats,
  callbackID
) {
  const msgArgs = [
    { type: 'float', value: time },
    { type: 'string', value: timeType },
    { type: 'integer', value: repeats },
    { type: 'string', value: callbackID },
  ];
  return OSCMessage(address, msgArgs);
}

export function playStmtToOSC(address, agent, score) {
  let msgArgs;
  switch (score.scoreType) {
    case t.PERCUSSIVE:
      msgArgs = percussiveScoreToOSCArgs(agent, score);
      break;
    case t.MELODIC:
      msgArgs = melodicScoreToOSCArgs(agent, score);
      break;
    case t.CONCRETE:
      msgArgs = concreteScoreToOSCArgs(agent, score);
      break;
  }
  return OSCMessage(address, msgArgs);
}

function percussiveScoreToOSCArgs(agent, score) {
  const patternType = 'percussive';
  const repeats =
    score.repeats === 'inf'
      ? { type: 'bang' }
      : { type: 'integer', value: score.repeats };
  const msgArgs = [
    { type: 'string', value: patternType },
    { type: 'string', value: agent.name },
    { type: 'array', value: score.notes },
    { type: 'array', value: score.durations },
    { type: 'array', value: score.instruments },
    { type: 'array', value: score.sustain },
    { type: 'array', value: score.attack },
    { type: 'array', value: score.panning },
    { type: 'integer', value: score.offset },
    repeats,
  ];
  return msgArgs;
}

function melodicScoreToOSCArgs(agent, score) {
  const patternType = 'melodic';
  const repeats =
    score.repeats === 'inf'
      ? { type: 'bang' }
      : { type: 'integer', value: score.repeats };
  const msgArgs = [
    { type: 'string', value: patternType },
    { type: 'string', value: agent.name },
    { type: 'array', value: score.notes },
    { type: 'array', value: score.durations },
    { type: 'string', value: score.instrument },
    { type: 'array', value: score.sustain },
    { type: 'array', value: score.attack },
    { type: 'array', value: score.panning },
    { type: 'integer', value: score.offset },
    repeats,
  ];
  return msgArgs;
}

function concreteScoreToOSCArgs(agent, score) {
  const patternType = 'concrete';
  const repeats =
    score.repeats === 'inf'
      ? { type: 'bang' }
      : { type: 'integer', value: score.repeats };
  const msgArgs = [
    { type: 'string', value: patternType },
    { type: 'string', value: agent.name },
    { type: 'integer', value: score.pitch },
    { type: 'array', value: score.amplitudes },
    { type: 'array', value: score.durations },
    { type: 'string', value: score.instrument },
    { type: 'array', value: score.panning },
    { type: 'integer', value: score.offset },
    repeats,
  ];
  return msgArgs;
}
