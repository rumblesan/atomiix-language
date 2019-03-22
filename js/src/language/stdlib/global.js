import * as audioActions from '../../actions/audio';

import { reevaluateAgent } from '../interpreter';
import { getAgentInfo } from '../interpreter/state';

import { expectArgs, expectString, expectNum } from './util';

import scales from '../../music/scales';

export function kill(state, { name, args }) {
  expectArgs(name, args, 0);

  return Object.keys(state.agents).map(name => {
    state.agents[name].playing = false;
    return audioActions.FreeAgent(name);
  });
}
export function scale(state, { name, args }) {
  expectArgs(name, args, 1);
  const scaleName = expectString(name, args[0]);
  const scale = scales.names[scaleName];
  if (!scale) {
    state.logger.warn(`${name}: ${scaleName} is not a valid scale name`);
    return;
  }
  state.scale = scale;
}

export function scalepush(state, command) {
  scale(state, command);
  let msgs = [];

  Object.keys(state.agents).forEach(name => {
    const agentInfo = getAgentInfo(state, name);
    if (agentInfo.playing) {
      msgs = msgs.concat(reevaluateAgent(state, name));
    }
  });
  return msgs;
}

export function tonic(state, { name, args }) {
  expectArgs(name, args, 1);
  const tonic = expectNum(name, args[0]);
  state.tonic = Math.floor(tonic);
}

export function tempo(state, { name, args }) {
  expectArgs(name, args, 1);
  const newTempo = expectNum(name, args[0]);
  const glide = args[0].modifier;

  return audioActions.SetTempo(newTempo, glide);
}
