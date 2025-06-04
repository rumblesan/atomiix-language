import { INBOUNDACTION } from '../types.js';
import * as t from './types.js';

export function AgentFinished(name) {
  return {
    type: INBOUNDACTION,
    actionType: t.AGENTFINISHED,
    name,
  };
}

export function AgentState(agentName, agentState) {
  return {
    type: INBOUNDACTION,
    actionType: t.AGENTSTATECHANGE,
    agentName,
    agentState,
  };
}

export function CallbackTriggered(callbackId, remaining) {
  return {
    type: INBOUNDACTION,
    actionType: t.CALLBACKTRIGGER,
    callbackId,
    remaining,
  };
}
