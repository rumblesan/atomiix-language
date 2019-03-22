import * as audioActions from '../../actions/audio';
import { ReplaceScore, ReplaceLine } from '../../actions/editor';

import { reevaluateAgent } from '../interpreter';
import { getAgentInfo } from '../interpreter/state';
import { scoreParser } from '../parser/scoreParser';

import { expectArgs, expectString, expectNum } from './util';

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

export function shake(state, { name, args }) {
  let msgs = [];
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);

  const agentInfo = getAgentInfo(state, agentName);
  const { score } = agentInfo;

  const oldScoreString = score.scoreString;
  const opener = oldScoreString[0];
  const closer = oldScoreString[oldScoreString.length - 1];
  const newChars = oldScoreString
    .slice(1, -1)
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
  const newScoreString = opener + newChars + closer;

  msgs.push(ReplaceScore(agentName, newScoreString));

  const newScoreToken = {
    content: newScoreString,
    line: score.line,
    character: score.position,
  };
  const newScore = scoreParser(
    score.instrument,
    newScoreToken,
    score.modifiers
  );
  agentInfo.score = newScore;

  if (agentInfo.playing) {
    msgs = msgs.concat(reevaluateAgent(state, agentName));
  }

  return msgs;
}

export function reverse(state, { name, args }) {
  let msgs = [];
  expectArgs(name, args, 1);
  const agentName = expectString(name, args[0]);

  const agentInfo = getAgentInfo(state, agentName);
  const { score } = agentInfo;

  const oldScoreString = score.scoreString;
  const opener = oldScoreString[0];
  const closer = oldScoreString[oldScoreString.length - 1];
  const newChars = oldScoreString
    .slice(1, -1)
    .split('')
    .reverse()
    .join('');
  const newScoreString = opener + newChars + closer;

  msgs.push(ReplaceScore(agentName, newScoreString));

  const newScoreToken = {
    content: newScoreString,
    line: score.line,
    character: score.position,
  };
  const newScore = scoreParser(
    score.instrument,
    newScoreToken,
    score.modifiers
  );
  agentInfo.score = newScore;

  if (agentInfo.playing) {
    msgs = msgs.concat(reevaluateAgent(state, agentName));
  }

  return msgs;
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
