import { stopAgent } from '../../language/interpreter/state';

export function handleInboundOSC(state, msg, log) {
  switch (msg.address) {
    case state.oscAddresses.agentFinished:
      handleAgentFinished(state, msg, log);
      break;
    default:
      log(`Message to unknown address: ${msg.address}`);
  }
}

function handleAgentFinished(state, msg, log) {
  const agentName = msg.args[0].value;
  log(`Marking agent ${agentName} as finished`);
  stopAgent(state, agentName);
}
