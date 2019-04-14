import parser from './language/parser';
import { interpret, freeAgents } from './language/interpreter';
import { handleInboundAction } from './language/inbound';
import * as errTypes from './language/errors/types';
import { create as init } from './language/interpreter/state';

import {
  oscAddresses,
  audioActionToOSC,
  oscToInboundAction,
  oscDestinations,
} from './transport/osc';

import * as actionTypes from './actions/types';
import * as editorActions from './actions/editor/types';

function partitionActions(actions) {
  const out = {
    audio: [],
    editor: [],
  };
  actions.forEach(m => {
    if (m.type === actionTypes.AUDIOACTION) {
      out.audio.push(m);
    } else if (m.type === actionTypes.EDITORACTION) {
      out.editor.push(m);
    }
  });
  return out;
}

function evaluate(state, code, lineOffset = 0) {
  try {
    const ast = parser.parse(code);
    const actions = interpret(state, ast, lineOffset);
    return partitionActions(actions);
  } catch (err) {
    let lineNum = '';
    switch (err.name) {
      case errTypes.AtomiixRuntimeErrorName:
        if (err.lineNumber !== undefined) {
          lineNum = ` on line ${err.lineNumber}`;
        }
        state.logger.error(`Error${lineNum}: ${err.message}`);
        break;
      case errTypes.AtomiixOSCErrorName:
        state.logger.error(`Error: ${err.message}`);
        break;
    }
    return { audio: [], editor: [] };
  }
}

function free(state, code) {
  const ast = parser.parse(code);
  const actions = freeAgents(state, ast);
  return partitionActions(actions);
}

function incomingAction(state, incoming) {
  const actions = handleInboundAction(state, incoming);
  return partitionActions(actions);
}

function actionToOSC(audioActions) {
  return audioActions.map(m => audioActionToOSC(oscAddresses, m));
}

function oscToAction(msg) {
  return oscToInboundAction(oscDestinations, msg);
}

export default {
  editorActions,
  init,
  evaluate,
  free,
  handleAction: handleInboundAction,
  incomingAction,
  actionToOSC,
  oscToAction,
};
