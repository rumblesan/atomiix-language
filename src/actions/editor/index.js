import { EDITORACTION } from '../types';
import * as t from './types';

export function MarkAgent(
  name,
  line,
  agentStart,
  agentFinish,
  scoreStart,
  scoreFinish
) {
  return {
    type: EDITORACTION,
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
    type: EDITORACTION,
    actionType: t.UNMARKTEXT,
    group: agentName,
  };
}

export function ReplaceScore(agentName, newScoreString) {
  return {
    type: EDITORACTION,
    actionType: t.REPLACETEXT,
    group: agentName,
    sections: {
      score: newScoreString,
    },
  };
}

export function ReplaceLine(lineNumber, newString) {
  return {
    type: EDITORACTION,
    actionType: t.REPLACELINE,
    line: lineNumber,
    text: newString,
  };
}

export function DisplayInfo(info) {
  return {
    type: EDITORACTION,
    actionType: t.DISPLAYINFO,
    info: info,
  };
}
