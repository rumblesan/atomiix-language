import * as osc from '../../transport/osc';
import { editorAction } from '../../transport/editor';
import * as actions from '../../transport/editorActions';

import { reevaluateAgent } from '../interpreter';
import { updateAgentScore } from '../interpreter/state';
import { scoreParser } from '../scoreParser';

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

export function shake(state, args) {
  let msgs = [];
  const name = 'shake';
  expectArgs(name, args, 1);
  const agentName = args[0];

  expectString(name, agentName);

  const updater = ({ scoreString, line, position }) => {
    const chars = scoreString.slice(1, -1);
    const opener = scoreString[0];
    const closer = scoreString[scoreString.length - 1];
    const newChars = chars
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    return {
      string: opener + newChars + closer,
      start: [line, position],
      end: [line, position + scoreString.length],
    };
  };

  // TODO clean this up!
  const updated = updateAgentScore(state, agentName.value, updater);
  msgs.push(
    editorAction(actions.REPLACETEXT, [
      updated.string,
      updated.start,
      updated.end,
    ])
  );
  const existing = state.agents[agentName.value];
  const oldScore = existing.score;
  const newScoreToken = {
    content: updated.string,
    line: oldScore.line,
    character: oldScore.position,
  };
  const newScore = scoreParser(
    oldScore.instrument,
    newScoreToken,
    oldScore.modifiers
  );
  existing.score = newScore;

  msgs = msgs.concat(reevaluateAgent(state, agentName.value));

  return msgs;
}
