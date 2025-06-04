import * as astTypes from '../ast/types.js';

import { reevaluateAgent } from '../interpreter/index.js';
import { getAgentInfo } from '../interpreter/state.js';
import { scoreParser } from '../parser/scoreParser.js';

import { ReplaceScore } from '../../actions/editor/index.js';

// this function figures out what needs to change when a command modifies the score of an agent
export function modifyScoreString(state, agentName, modifyFunc) {
  let msgs = [];

  const agentInfo = getAgentInfo(state, agentName);
  const { score } = agentInfo;

  const newScoreString = modifyFunc(score);

  msgs.push(ReplaceScore(agentName, newScoreString));

  const newScoreToken = {
    content: newScoreString,
    line: score.line,
    character: score.position,
  };
  const newScore = scoreParser(
    state,
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

// not currently used - all below functions will allow real-time/live changes to post-score modifiers
export function writeScoreModifiers(modifiers) {
  return modifiers
    .map((m) => {
      switch (m.type) {
        case astTypes.SCOREOPERATOR:
          return writeScoreOperator(m);
        case astTypes.SCOREMODIFIER:
          return writeScoreMod(m);
        default:
          return '';
      }
    })
    .join('');
}

function writeScoreOperator({ operator, value }) {
  return `${operator}${value}`;
}

function writeSustainMod({ noteLength, multiplier }) {
  if (multiplier === null) {
    return `(${noteLength})`;
  } else {
    return `(${noteLength}~${multiplier})`;
  }
}

function writeScoreMod(modifier) {
  switch (modifier.modifierType) {
    case astTypes.PANNING:
      return `<${modifier.values.join('')}>`;
    case astTypes.ATTACK:
      return `^${modifier.values.join('')}^`;
    case astTypes.SUSTAIN:
      return writeSustainMod(modifier);
    default:
      return '';
  }
}
