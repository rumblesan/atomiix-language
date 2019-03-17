import { stopAgent } from '../../language/interpreter/state';
import { interpret } from '../../language/interpreter';

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
  const agentName = msg.args[0].value;
  state.logger.info(`Marking agent ${agentName} as finished`);
  stopAgent(state, agentName);
  return [];
}

function handleCallbackTriggered(state, msg) {
  console.log('callback', msg);
  const callbackID = msg.args[0].value;
  const cb = state.callbacks[callbackID];
  if (!cb) {
    return defaultResp;
  }
  console.log(cb);
  const out = interpret(state, cb.command);
  console.log('out', out);
  return out;
}
