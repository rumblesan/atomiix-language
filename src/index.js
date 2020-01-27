// main file - loading everything when the plugin starts in atom and you load an ixi file
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
  oscMessagesToBundle,
} from './transport/osc';

import * as actionTypes from './actions/types';
import * as editorActions from './actions/editor/types';
import { agentStates } from './language/interpreter/agents';

const constants = {
  editorActions,
  agentStates,
};

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

function handleErr(state, err) {
  switch (err.name) {
    case errTypes.AtomiixRuntimeErrorName:
      state.logger.error(err.formattedMessage());
      break;
    case errTypes.AtomiixOSCErrorName:
      state.logger.error(err.formattedMessage());
      break;
  }
  return { audio: [], editor: [] };
}

function evaluate(state, code, lineOffset = 0) {
  try {
    const parsed = parser.parse(code);
    const actions = interpret(state, parsed.ast, lineOffset);
    return partitionActions(actions);
  } catch (err) {
    return handleErr(state, err);
  }
}

function free(state, code) {
  try {
    const parsed = parser.parse(code);
    const actions = freeAgents(state, parsed.ast);
    return partitionActions(actions);
  } catch (err) {
    return handleErr(state, err);
  }
}

function incomingAction(state, incoming) {
  try {
    const actions = handleInboundAction(state, incoming);
    return partitionActions(actions);
  } catch (err) {
    return handleErr(state, err);
  }
}

function actionToOSC(audioActions) {
  return audioActions.map(m => audioActionToOSC(oscAddresses, m));
}

function actionsToOSCBundle(audioActions) {
  return oscMessagesToBundle(
    audioActions.map(m => audioActionToOSC(oscAddresses, m))
  );
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
  actionsToOSCBundle,
  oscToAction,
  constants,
};
