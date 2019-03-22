import * as audioActions from '../../actions/audio';

import { getAgentInfo } from '../interpreter/state';

import { expectArgs, expectString } from './util';

export function doze(state, { name, args }) {
  const msgs = [];
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);

  const agentInfo = getAgentInfo(state, agentName);
  if (agentInfo) {
    agentInfo.playing = false;
    msgs.push(audioActions.AgentMethod(agentName, name));
  }
  return msgs;
}

export function wake(state, { name, args }) {
  const msgs = [];
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);

  const agentInfo = getAgentInfo(state, agentName);
  if (agentInfo) {
    agentInfo.playing = true;
    msgs.push(audioActions.AgentMethod(agentName, name));
  }
  return msgs;
}
