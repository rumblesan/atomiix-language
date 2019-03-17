import parser from './language/parser';

import { handleInboundOSC } from './transport/osc/inbound';
import { interpret, freeAgents } from './language/interpreter';
import { create as createState } from './language/interpreter/state';

import * as editorActions from './transport/editor/actions';

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
    } else if (m.type === editorActions.EDITORACTION) {
      editorEvents.push(m);
    }
  });
  return {
    messages: oscMessages,
    actions: editorEvents,
  };
}

function incomingOSC(state, msg) {
  const { messages } = handleInboundOSC(state, msg);
  const oscMessages = [];
  const editorEvents = [];
  messages.forEach(m => {
    if (m.type === 'OSCMESSAGE') {
      oscMessages.push(m);
    } else if (m.type === editorActions.EDITORACTION) {
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
    } else if (m.type === editorActions.EDITORACTION) {
      editorEvents.push(m);
    }
  });
  return {
    messages: oscMessages,
    actions: editorEvents,
  };
}

export default {
  language,
  editorActions,
  init,
  evaluate,
  free,
  incomingOSC,
  parser,
};
