import * as osc from '../../transport/osc';

import { expectArgs, expectString } from './util';

export function doze(state, args) {
  const name = 'doze';
  expectArgs(name, args, 1);
  const agentName = args[0];

  expectString(name, agentName);

  const msg = osc.agentMethodToOSC(
    state.oscAddresses.command,
    name,
    agentName.value
  );
  return [msg];
}

export function wake(state, args) {
  const name = 'wake';
  expectArgs(name, args, 1);
  const agentName = args[0];

  expectString(name, agentName);

  const msg = osc.agentMethodToOSC(
    state.oscAddresses.command,
    'wake',
    agentName.value
  );
  return [msg];
}
