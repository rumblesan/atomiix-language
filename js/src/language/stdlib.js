import * as astTypes from '../ast/types';

import * as osc from '../transport/osc';

import { AtomiixRuntimeError } from './runtime';

export function doze(state, args) {
  if (args.length !== 1) {
    throw new AtomiixRuntimeError('doze expects a single argument');
  }
  const agentName = args[0];

  if (agentName.type !== astTypes.STRING) {
    throw new AtomiixRuntimeError(
      `doze expected String but got ${agentName.type}`
    );
  }
  const msg = osc.agentMethodToOSC(
    state.oscAddresses.command,
    'doze',
    agentName.value
  );
  return [msg];
}

export function wake(state, args) {
  if (args.length !== 1) {
    throw new AtomiixRuntimeError('wake expects a single argument');
  }
  const agentName = args[0];

  if (agentName.type !== astTypes.STRING) {
    throw new AtomiixRuntimeError(
      `doze expected String but got ${agentName.type}`
    );
  }
  const msg = osc.agentMethodToOSC(
    state.oscAddresses.command,
    'wake',
    agentName.value
  );
  return [msg];
}
