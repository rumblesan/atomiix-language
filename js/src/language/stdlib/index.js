import * as osc from '../../transport/osc';
import { editorAction } from '../../transport/editor';
import * as actions from '../../transport/editorActions';

import { expectArgs, expectString } from './util';

export function doze(state, args) {
  const msgs = [];
  const name = 'doze';
  expectArgs(name, args, 1);
  const agentName = args[0];

  expectString(name, agentName);

  const existing = state.agents[agentName.value];
  if (existing) {
    msgs.push(
      osc.agentMethodToOSC(state.oscAddresses.command, name, agentName.value)
    );
    msgs.push(editorAction(actions.LOWLIGHTLINE, [existing.agent.line]));
  }
  return msgs;
}

export function wake(state, args) {
  const msgs = [];
  const name = 'wake';
  expectArgs(name, args, 1);
  const agentName = args[0];

  expectString(name, agentName);

  const existing = state.agents[agentName.value];
  if (existing) {
    msgs.push(
      osc.agentMethodToOSC(state.oscAddresses.command, name, agentName.value)
    );
    msgs.push(editorAction(actions.HIGHLIGHTLINE, [existing.agent.line]));
  }
  return msgs;
}
