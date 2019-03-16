import * as osc from '../../transport/osc/outbound';
import { ReplaceScore, ReplaceLine } from '../../transport/editor';

import { reevaluateAgent } from '../interpreter';
import { getAgentInfo } from '../interpreter/state';
import { scoreParser } from '../scoreParser';

import { expectArgs, expectString, expectNum } from './util';

import scales from '../../music/scales';

export function doze(state, command, args) {
  const msgs = [];
  const fname = 'doze';
  expectArgs(fname, args, 1);
  const agentName = expectString(fname, args[0]);

  const agentInfo = getAgentInfo(state, agentName);
  if (agentInfo) {
    agentInfo.playing = false;
    msgs.push(
      osc.agentMethodToOSC(state.oscAddresses.command, fname, agentName)
    );
  }
  return msgs;
}

export function wake(state, command, args) {
  const msgs = [];
  const fname = 'wake';
  expectArgs(fname, args, 1);
  const agentName = expectString(fname, args[0]);

  const agentInfo = getAgentInfo(state, agentName);
  if (agentInfo) {
    agentInfo.playing = true;
    msgs.push(
      osc.agentMethodToOSC(state.oscAddresses.command, fname, agentName)
    );
  }
  return msgs;
}

export function shake(state, command, args) {
  let msgs = [];
  const fname = 'shake';
  expectArgs(fname, args, 1);
  const agentName = expectString(fname, args[0]);

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

export function scale(state, command, args) {
  const fname = 'scale';
  expectArgs(fname, args, 1);
  const scaleName = expectString(fname, args[0]);
  const scale = scales.names[scaleName];
  if (!scale) {
    state.logger.warn(`${fname}: ${scaleName} is not a valid scale name`);
    return;
  }
  state.scale = scale;
}

export function tonic(state, command, args) {
  const fname = 'tonic';
  expectArgs(fname, args, 1);
  const tonic = expectNum(fname, args[0]);
  state.tonic = Math.floor(tonic);
}

export function grid(state, command, args, lineOffset) {
  let msgs = [];
  const fname = 'grid';
  expectArgs(fname, args, 1);
  const gridSpacing = Math.floor(expectNum(fname, args[0]));
  const repeats = Math.floor(70 / gridSpacing);
  const gridLine =
    '          ' +
    Array(repeats)
      .fill(' '.repeat(gridSpacing - 1))
      .join('|');
  msgs.push(ReplaceLine(command.line + lineOffset, gridLine));
  return msgs;
}
