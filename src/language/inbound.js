import * as errTypes from './errors/types';
import * as inboundTypes from '../actions/inbound/types';
import { stopAgent } from './interpreter/state';
import { interpret } from './interpreter';

export function handleInboundAction(state, action) {
  switch (action.actionType) {
    case inboundTypes.AGENTFINISHED:
      return handleAgentFinished(state, action);
    case inboundTypes.CALLBACKTRIGGER:
      return handleCallbackTriggered(state, action);
    default:
      state.logger.warning(`${action.actionType} is an unknown action type`);
  }
  return [];
}

function handleAgentFinished(state, { name }) {
  state.logger.info(`Marking agent ${name} as finished`);
  stopAgent(state, name);
  return [];
}

function handleCallbackTriggered(state, { callbackId, remaining }) {
  let out = [];
  const cb = state.callbacks[callbackId];
  if (!cb) {
    state.logger.error(`Error: no callback with id ${callbackId}`);
    return out;
  }
  try {
    out = interpret(state, cb.command, null);
  } catch (err) {
    if (err.name === errTypes.AtomiixRuntimeErrorName) {
      err.setCallbackStatus(true);
      err.setLineNumber(undefined);
      throw err;
    }
  }
  if (remaining < 1) {
    delete state.callbacks[callbackId];
  }
  return out;
}
