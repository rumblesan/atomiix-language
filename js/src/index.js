import parser from './language/parser';

import { interpret, freeAgents } from './language/interpreter';
import {
  create as createState,
  updateAgentPosition,
} from './language/interpreter/state';

const language = 'atomiix';

function init() {
  return createState();
}

function evaluate(state, code, lineOffset = 0) {
  const ast = parser.parse(code);
  const { messages } = interpret(state, ast, lineOffset);
  const oscMessages = [];
  const editorEvents = [];
  messages.forEach(m => {
    if (m.type === 'OSCMESSAGE') {
      oscMessages.push(m);
    } else if (m.type === 'EDITORACTION') {
      editorEvents.push(m);
    }
  });
  return {
    messages: oscMessages,
    actions: editorEvents,
  };
}

function free(state, code) {
  const ast = parser.parse(code);
  const { messages } = freeAgents(state, ast);
  const oscMessages = [];
  const editorEvents = [];
  messages.forEach(m => {
    if (m.type === 'OSCMESSAGE') {
      oscMessages.push(m);
    } else if (m.type === 'EDITORACTION') {
      editorEvents.push(m);
    }
  });
  return {
    messages: oscMessages,
    actions: editorEvents,
  };
}

function moveAgent(state, agentName, newLine) {
  const actions = updateAgentPosition(state, agentName, newLine);
  return {
    messages: [],
    actions,
  };
}

export default {
  language,
  init,
  evaluate,
  free,
  moveAgent,
  parser,
};
