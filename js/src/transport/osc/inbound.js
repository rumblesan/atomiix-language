import { stopAgent } from '../../language/interpreter/state';
import { interpret } from '../../language/interpreter';
import { AtomiixOSCError } from '../../language/runtime';

function getStringArg(name, msg, argNum) {
  const el = msg.args[argNum];
  if (el.type !== 'string') {
    throw new AtomiixOSCError(`${name} expected String but got ${el.type}`);
  }
  return el.value;
}

function getNumArg(name, msg, argNum) {
  const el = msg.args[argNum];
  if (el.type !== 'float' && el.type !== 'integer') {
    throw new AtomiixOSCError(
      `${name} expected Float or Integer but got ${el.type}`
    );
  }
  return el.value;
}

export function handleInboundOSC(state, msg) {
  switch (msg.address) {
    case state.oscAddresses.agentFinished:
      return handleAgentFinished(state, msg);
    case state.oscAddresses.callback:
      return handleCallbackTriggered(state, msg);
    default:
      state.logger.warning(`Message to unknown address: ${msg.address}`);
  }
  return [];
}

function handleAgentFinished(state, msg) {
  const agentName = getStringArg('agent finished', msg, 0);
  state.logger.info(`Marking agent ${agentName} as finished`);
  stopAgent(state, agentName);
  return [];
}

function handleCallbackTriggered(state, msg) {
  const callbackID = getStringArg('callback', msg, 0);
  const remaining = getNumArg('callback', msg, 1);
  const cb = state.callbacks[callbackID];
  if (!cb) {
    return [];
  }
  const out = interpret(state, cb.command);
  if (remaining < 1) {
    delete state.callbacks[callbackID];
  }
  return out;
}
