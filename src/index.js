// main file - loading everything when the plugin starts in atom and you load an ixi file
import parser from './language/parser/index.js';
import { interpret, freeAgents } from './language/interpreter/index.js';
import { handleInboundAction } from './language/inbound.js';
import * as errTypes from './language/errors/types.js';
import { create as init } from './language/interpreter/state.js';

import {
  oscAddresses,
  audioActionToOSC,
  oscToInboundAction,
  oscDestinations,
  oscMessagesToBundle,
} from './transport/osc.js';

import * as actionTypes from './actions/types.js';
import * as editorActions from './actions/editor/types.js';
import { agentStates } from './language/interpreter/agents.js';

const constants = {
  editorActions,
  agentStates,
};

function partitionActions(actions) {
  const out = {
    audio: [],
    editor: [],
  };
  actions.forEach((m) => {
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
}

function evaluate(state, code, lineOffset = 0) {
  try {
    const parsed = parser.parse(code);
    if (parsed.errors.length < 0) {
      return { errors: parsed.errors };
    }
    const actions = interpret(state, parsed.ast, lineOffset);
    return partitionActions(actions);
  } catch (err) {
    handleErr(state, err);
    return { audio: [], editor: [], errors: [err] };
  }
}

function free(state, code) {
  try {
    const parsed = parser.parse(code);
    if (parsed.errors.length < 0) {
      return { errors: parsed.errors };
    }
    const actions = freeAgents(state, parsed.ast);
    return partitionActions(actions);
  } catch (err) {
    handleErr(state, err);
    return { audio: [], editor: [], errors: [err] };
  }
}

function incomingAction(state, incoming) {
  try {
    const actions = handleInboundAction(state, incoming);
    return partitionActions(actions);
  } catch (err) {
    handleErr(state, err);
    return { audio: [], editor: [], errors: [err] };
  }
}

function actionToOSC(audioActions) {
  return audioActions.map((m) => audioActionToOSC(oscAddresses, m));
}

function actionsToOSCBundle(audioActions) {
  return oscMessagesToBundle(
    audioActions.map((m) => audioActionToOSC(oscAddresses, m))
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
