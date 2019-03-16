import * as t from './actions';

export function MarkAgent(
  name,
  line,
  agentStart,
  agentFinish,
  scoreStart,
  scoreFinish
) {
  return {
    type: t.EDITORACTION,
    actionType: t.MARKTEXT,
    group: name,
    sections: {
      agent: {
        line,
        start: agentStart,
        finish: agentFinish,
      },
      score: {
        line,
        start: scoreStart,
        finish: scoreFinish,
      },
    },
  };
}

export function UnmarkAgent(agentName) {
  return {
    type: t.EDITORACTION,
    actionType: t.UNMARKTEXT,
    group: agentName,
  };
}

export function ReplaceScore(agentName, newScoreString) {
  return {
    type: t.EDITORACTION,
    actionType: t.REPLACETEXT,
    group: agentName,
    sections: {
      score: newScoreString,
    },
  };
}