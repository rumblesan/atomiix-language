import { EDITORACTION } from '../types';
import * as t from './types';

// keeps track of what line an agent is on - sends to atom to deal with
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

export function MarkFuture(callbackId, line, futureStart, futureFinish) {
  return {
    type: EDITORACTION,
    actionType: t.MARKTEXT,
    group: callbackId,
    sections: {
      future: {
        line,
        start: futureStart,
        finish: futureFinish,
      },
    },
  };
}

export function FlashFuture(callbackId) {
  return {
    type: EDITORACTION,
    actionType: t.FLASHMARKEDTEXT,
    group: callbackId,
  };
}

export function UnmarkAgent(agentName) {
  return {
    type: EDITORACTION,
    actionType: t.UNMARKTEXT,
    group: agentName,
  };
}

export function DisplayAgentState(agentName, agentState) {
  return {
    type: EDITORACTION,
    actionType: t.DISPLAYAGENTSTATE,
    group: agentName,
    agentState,
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
