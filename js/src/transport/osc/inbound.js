import { stopAgent } from '../../language/interpreter/state';

export function handleInboundOSC(state, msg) {
  switch (msg.address) {
    case state.oscAddresses.agentFinished:
      handleAgentFinished(state, msg);
      break;
    default:
      state.logger.warning(`Message to unknown address: ${msg.address}`);
  }
}

function handleAgentFinished(state, msg) {
  const agentName = msg.args[0].value;
  state.logger.info(`Marking agent ${agentName} as finished`);
  stopAgent(state, agentName);
}
