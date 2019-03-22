import { INBOUNDACTION } from '../types';
import * as t from './types';

export function AgentFinished(name) {
  return {
    type: INBOUNDACTION,
    actionType: t.AGENTFINISHED,
    name,
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
