import { DisplayAgentState } from '../actions/editor';
import * as errTypes from './errors/types';
import * as inboundActions from '../actions/inbound/types';
import { stopAgent, getAgentInfo } from './interpreter/state';
import { agentStates } from './interpreter/agents';
import { interpret } from './interpreter';

export function handleInboundAction(state, action) {
  switch (action.actionType) {
    case inboundActions.AGENTFINISHED:
      return handleAgentFinished(state, action);
    case inboundActions.AGENTSTATECHANGE:
      return handleAgentStateChange(state, action);
    case inboundActions.CALLBACKTRIGGER:
      return handleCallbackTriggered(state, action);
    default:
      state.logger.warning(`${action.actionType} is an unknown action type`);
  }
  return [];
}

function handleAgentFinished(state, { name }) {
  const msgs = [];
  state.logger.info(`Marking agent ${name} as finished`);
  stopAgent(state, name);
  msgs.push(DisplayAgentState(name, agentStates.STOPPED));
  return msgs;
}

function handleAgentStateChange(state, { agentName, agentState }) {
  const { agent } = getAgentInfo(state, agentName);
  agent.state = agentState;
  return [DisplayAgentState(agent.name, agent.state)];
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
