import * as osc from '../../transport/osc';
import { ReplaceScore } from '../../transport/editor';

import { reevaluateAgent } from '../interpreter';
import { getAgentInfo } from '../interpreter/state';
import { scoreParser } from '../scoreParser';

import { expectArgs, expectString } from './util';

export function doze(state, args) {
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

export function wake(state, args) {
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

export function shake(state, args) {
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
