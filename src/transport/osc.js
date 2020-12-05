import * as inbound from '../actions/inbound';
import { agentStates } from '../language/interpreter/agents';
import * as at from '../actions/audio/types';
import { AtomiixOSCError } from '../language/errors';

export const oscAddresses = {
  playPattern: '/play/pattern',
  command: '/command',
  agentAmplitude: '/agent/amplitude',
  addFX: '/agent/effects/add',
  rmFX: '/agent/effects/remove',
  tempo: '/tempo',
  callback: '/callback',
  query: '/query',
};

export function audioActionToOSC(addresses, action) {
  switch (action.actionType) {
    case at.AGENTMETHOD:
      return agentMethodOSC(addresses.command, action);
    case at.FREEAGENT:
      return freeAgentOSC(addresses.command, action);
    case at.NAPAGENT:
      return napAgentOSC(addresses.command, action);
    case at.ADDAGENTFX:
      return addAgentFXOSC(addresses.addFX, action);
    case at.RMAGENTFX:
      return removeAgentFXOSC(addresses.rmFX, action);
    case at.SETAGENTAMP:
      return setAgentAmpOSC(addresses.agentAmplitude, action);
    case at.SETTEMPO:
      return setTempoOSC(addresses.tempo, action);
    case at.QUERY:
      return queryOSC(addresses.query, action);
    case at.FUTURECALLBACK:
      return futureCallbackOSC(addresses.callback, action);
    case at.PLAYPERCUSSIVE:
      return playPercussiveOSC(addresses.playPattern, action);
    case at.PLAYMELODIC:
      return playMelodicOSC(addresses.playPattern, action);
    case at.PLAYCONCRETE:
      return playConcreteOSC(addresses.playPattern, action);
  }
}

export const oscDestinations = {
  agentFinished: '/finished',
  callback: '/callback',
  agentState: '/agent/state',
};

export function oscToInboundAction(destinations, msg) {
  switch (msg.address) {
    case destinations.agentFinished:
      return oscAgentFinished(msg);
    case destinations.callback:
      return oscCallbackTriggered(msg);
    case destinations.agentState:
      return oscAgentStateChanged(msg);
    default:
      throw new AtomiixOSCError(
        `${msg.address} is not a valid incoming address`
      );
  }
}

export function oscMessagesToBundle(messages, timetag = null) {
  return {
    oscType: 'bundle',
    timetag,
    elements: messages,
  };
}

function OSCMessage(address, args) {
  return {
    oscType: 'message',
    address,
    args,
  };
}

function agentMethodOSC(address, { agent, method }) {
  const msgArgs = [
    { type: 'string', value: method },
    { type: 'string', value: agent },
  ];
  return OSCMessage(address, msgArgs);
}

function freeAgentOSC(address, { agent }) {
  const msgArgs = [
    { type: 'string', value: 'free' },
    { type: 'string', value: agent },
  ];
  return OSCMessage(address, msgArgs);
}

function napAgentOSC(address, { agent, time, timeType, repeats }) {
  const msgArgs = [
    { type: 'string', value: 'nap' },
    { type: 'string', value: agent },
    { type: 'float', value: time },
    { type: 'string', value: timeType },
    { type: 'integer', value: repeats },
  ];
  return OSCMessage(address, msgArgs);
}

function addAgentFXOSC(address, { agent, fxList }) {
  const msgArgs = [
    { type: 'string', value: agent },
    { type: 'array', value: fxList },
  ];
  return OSCMessage(address, msgArgs);
}

function removeAgentFXOSC(address, { agent, fxList }) {
  const msgArgs = [{ type: 'string', value: agent }];
  if (fxList.length > 0) {
    msgArgs.push({ type: 'array', value: fxList });
  }
  return OSCMessage(address, msgArgs);
}

function setAgentAmpOSC(address, { agent, amplitude }) {
  const msgArgs = [
    { type: 'string', value: agent },
    { type: 'float', value: amplitude },
  ];
  return OSCMessage(address, msgArgs);
}

function setTempoOSC(address, { tempo, glide }) {
  const msgArgs = [{ type: 'float', value: tempo }];
  if (glide) {
    msgArgs.push({ type: 'float', value: glide });
  }
  return OSCMessage(address, msgArgs);
}

function queryOSC(address, { category }) {
  const msgArgs = [{ type: 'string', value: category }];
  return OSCMessage(address, msgArgs);
}

function futureCallbackOSC(address, { time, timeType, repeats, callbackID }) {
  const msgArgs = [
    { type: 'float', value: time },
    { type: 'string', value: timeType },
    { type: 'integer', value: repeats },
    { type: 'string', value: callbackID },
  ];
  return OSCMessage(address, msgArgs);
}

function playPercussiveOSC(address, action) {
  const patternType = 'percussive';
  const repeats =
    action.repeats === 'inf'
      ? { type: 'bang' }
      : { type: 'integer', value: action.repeats };
  const msgArgs = [
    { type: 'string', value: patternType },
    { type: 'string', value: action.agent },
    { type: 'array', value: action.notes },
    { type: 'array', value: action.durations },
    { type: 'array', value: action.instruments },
    { type: 'array', value: action.sustain },
    { type: 'array', value: action.attack },
    { type: 'array', value: action.panning },
    { type: 'float', value: action.offset },
    { type: 'string', value: action.bankName },
    { type: 'integer', value: action.bankNumber },
    repeats,
  ];
  return OSCMessage(address, msgArgs);
}

function playMelodicOSC(address, action) {
  const patternType = 'melodic';
  const repeats =
    action.repeats === 'inf'
      ? { type: 'bang' }
      : { type: 'integer', value: action.repeats };
  const noteArr = action.notes.map(n => {
    if (typeof n === 'number') {
      return { type: 'integer', value: n };
    }
    return { type: 'array', value: n };
  });
  const msgArgs = [
    { type: 'string', value: patternType },
    { type: 'string', value: action.agent },
    { type: 'array', value: noteArr },
    { type: 'array', value: action.durations },
    { type: 'string', value: action.instrument },
    { type: 'array', value: action.sustain },
    { type: 'array', value: action.attack },
    { type: 'array', value: action.panning },
    { type: 'float', value: action.offset },
    repeats,
    { type: 'integer', value: action.midiChannel },
  ];
  return OSCMessage(address, msgArgs);
}

function playConcreteOSC(address, action) {
  const patternType = 'concrete';
  const repeats =
    action.repeats === 'inf'
      ? { type: 'bang' }
      : { type: 'integer', value: action.repeats };
  const msgArgs = [
    { type: 'string', value: patternType },
    { type: 'string', value: action.agent },
    { type: 'integer', value: action.pitch },
    { type: 'array', value: action.amplitudes },
    { type: 'array', value: action.durations },
    { type: 'string', value: action.instrument },
    { type: 'array', value: action.panning },
    { type: 'float', value: action.offset },
    repeats,
  ];
  return OSCMessage(address, msgArgs);
}

function oscAgentFinished(msg) {
  const agentName = getStringArg(msg, 0);
  return inbound.AgentFinished(agentName);
}

function oscCallbackTriggered(msg) {
  const callbackID = getStringArg(msg, 0);
  const remaining = getNumArg(msg, 1);
  return inbound.CallbackTriggered(callbackID, remaining);
}

function oscAgentStateChanged(msg) {
  const agentName = getStringArg(msg, 0);
  const agentState = getStringArg(msg, 1);
  let newState = '';
  switch (agentState) {
    case 'playing':
      newState = agentStates.PLAYING;
      break;
    case 'sleeping':
      newState = agentStates.SLEEPING;
      break;
    case 'stopped':
      newState = agentStates.STOPPED;
      break;
    default:
      throw new AtomiixOSCError(`${agentState} is not a valid agent state`);
  }
  return inbound.AgentState(agentName, newState);
}

function getStringArg(msg, argNum) {
  const el = msg.args[argNum];
  if (el.type !== 'string') {
    throw new AtomiixOSCError(`Expected String but got ${el.type}`);
  }
  return el.value;
}

function getNumArg(msg, argNum) {
  const el = msg.args[argNum];
  if (el.type !== 'float' && el.type !== 'integer') {
    throw new AtomiixOSCError(`Expected Float or Integer but got ${el.type}`);
  }
  return el.value;
}
