import * as audioActions from '../../actions/audio';
import { ReplaceLine } from '../../actions/editor';

import { PERCUSSIVE } from '../ast/types';
import { getAgentInfo } from '../interpreter/state';
import { modifyScoreString } from './rewriting';
import { reevaluateAgent } from '../interpreter';

import { expectArgs, expectString, expectNum, optionalNum } from './util';

import scales from '../../music/scales';

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

export function kill(state, { name, args }) {
  expectArgs(name, args, 0);

  return Object.keys(state.agents).map(name => {
    state.agents[name].playing = false;
    return audioActions.FreeAgent(name);
  });
}

export function shake(state, { name, args }) {
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const newChars = oldScoreString
      .slice(1, -1)
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function reverse(state, { name, args }) {
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const newChars = oldScoreString
      .slice(1, -1)
      .split('')
      .reverse()
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
  });
}

export function shiftr(state, { name, args }) {
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);
  const shift = optionalNum(name, args[1], 1);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    if (oldScoreString.length < 4) {
      return oldScoreString;
    }
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const chars = oldScoreString.slice(1, -1);
    const sameChars = chars.slice(0, -shift);
    const movedChars = chars.substr(chars.length - shift);
    const newScoreString = opener + movedChars + sameChars + closer;
    return newScoreString;
  });
}

export function shiftl(state, { name, args }) {
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);
  const shift = optionalNum(name, args[1], 1);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    if (oldScoreString.length < 4) {
      return oldScoreString;
    }
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const chars = oldScoreString.slice(1, -1);
    const sameChars = chars.substr(0, shift);
    const movedChars = chars.slice(shift);
    const newScoreString = opener + movedChars + sameChars + closer;
    return newScoreString;
  });
}

export function up(state, { name, args }) {
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);

  return modifyScoreString(state, agentName, score => {
    if (score.scoreType != PERCUSSIVE) {
      return score.scoreString;
    }
    return score.scoreString.toUpperCase();
  });
}

export function down(state, { name, args }) {
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);

  return modifyScoreString(state, agentName, score => {
    if (score.scoreType != PERCUSSIVE) {
      return score.scoreString;
    }
    return score.scoreString.toLowerCase();
  });
}

const isUpper = /^[A-Z]/;
const isLower = /^[a-z]/;
export function yoyo(state, { name, args }) {
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);

  return modifyScoreString(state, agentName, score => {
    const oldScoreString = score.scoreString;
    const opener = oldScoreString[0];
    const closer = oldScoreString[oldScoreString.length - 1];
    const newChars = oldScoreString
      .slice(1, -1)
      .split('')
      .map(c => {
        if (isUpper.test(c)) {
          return c.toLowerCase();
        } else if (isLower.test(c)) {
          return c.toUpperCase();
        } else {
          return c;
        }
      })
      .join('');
    const newScoreString = opener + newChars + closer;
    return newScoreString;
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

export function grid(state, { name, args, line }, lineOffset) {
  let msgs = [];
  expectArgs(name, args, 1);
  const gridSpacing = Math.floor(expectNum(name, args[0]));
  const repeats = Math.floor(70 / gridSpacing);
  const gridLine =
    '          |' + (' '.repeat(gridSpacing - 1) + '|').repeat(repeats);
  msgs.push(ReplaceLine(line + lineOffset, gridLine));
  return msgs;
}

export function tempo(state, { name, args }) {
  expectArgs(name, args, 1);
  const newTempo = expectNum(name, args[0]);
  const glide = args[0].modifier;

  return audioActions.SetTempo(newTempo, glide);
}
