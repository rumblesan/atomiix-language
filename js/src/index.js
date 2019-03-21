import parser from './language/parser';

import { handleInboundOSC } from './transport/osc/inbound';
import { interpret, freeAgents } from './language/interpreter';
import { create as createState } from './language/interpreter/state';

import * as actionTypes from './actions/types';
import * as editorActions from './actions/editor/types';

function partitionMessages(messages) {
  const out = {
    messages: [],
    actions: [],
  };
  messages.forEach(m => {
    if (m.type === 'OSCMESSAGE') {
      out.messages.push(m);
    } else if (m.type === actionTypes.EDITORACTION) {
      out.actions.push(m);
    }
  });
  return out;
}

function evaluate(state, code, lineOffset = 0) {
  const ast = parser.parse(code);
  const { messages } = interpret(state, ast, lineOffset);
  return partitionMessages(messages);
}

function incomingOSC(state, msg) {
  const { messages } = handleInboundOSC(state, msg);
  return partitionMessages(messages);
}

function free(state, code) {
  const ast = parser.parse(code);
  const { messages } = freeAgents(state, ast);
  return partitionMessages(messages);
}

export default {
  editorActions,
  init: createState,
  evaluate,
  free,
  incomingOSC,
};
