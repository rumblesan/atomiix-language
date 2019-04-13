import * as audioActions from '../../actions/audio';
import * as astTypes from '../ast/types';

import { getAgentInfo } from '../interpreter/state';

import { AtomiixRuntimeError } from '../errors';

import { expectArgs, expectString, handleGroup } from './util';

export function doze(state, { name, args }) {
  expectArgs(name, args, 1);
  const agentOrGroup = expectString(name, args[0]);

  return handleGroup(state, agentOrGroup, (s, n) => {
    const msgs = [];
    const agentInfo = getAgentInfo(s, n);
    if (agentInfo) {
      agentInfo.playing = false;
      msgs.push(audioActions.AgentMethod(n, name));
    }
    return msgs;
  });
}

export function wake(state, { name, args }) {
  expectArgs(name, args, 1);
  const agentOrGroup = expectString(name, args[0]);

  return handleGroup(state, agentOrGroup, (s, n) => {
    const msgs = [];
    const agentInfo = getAgentInfo(s, n);
    if (agentInfo) {
      agentInfo.playing = false;
      msgs.push(audioActions.AgentMethod(n, name));
    }
    return msgs;
  });
}

export function nap(state, { name, args }) {
  expectArgs(name, args, 2);
  const agentOrGroup = expectString(name, args[0]);

  const timeArg = args[1];
  const time = timeArg.value;
  const timeType = timeArg.type === astTypes.BEAT ? 'beats' : 'seconds';
  const repeats = timeArg.modifier || 1;

  return handleGroup(state, agentOrGroup, (s, n) => {
    const msgs = [];
    const agentInfo = getAgentInfo(s, n);
    if (agentInfo) {
      agentInfo.playing = false;
      msgs.push(audioActions.NapAgent(n, time, timeType, repeats));
    }
    return msgs;
  });
}

export function ungroup(state, { name, args }) {
  expectArgs(name, args, 1);
  const groupName = expectString(name, args[0]);

  if (!state.groups[groupName]) {
    throw new AtomiixRuntimeError(`${name} is not the name of a group`);
  }

  delete state.groups[groupName];
  return [];
}
