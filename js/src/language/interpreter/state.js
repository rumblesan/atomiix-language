import { AtomiixRuntimeError } from '../runtime';

import scales from '../../music/scales';

import * as stdlib from '../stdlib';

import { editorAction } from '../../transport/editor';
import * as actions from '../../transport/editorActions';

export function create() {
  return {
    scale: scales.names.Maj,
    tonic: 60,
    stdlib,
    agents: {},
    oscAddresses: {
      playPattern: '/play/pattern',
      command: '/command',
      agentAmplitude: '/agent/amplitude',
      addFX: '/agent/effects/add',
      rmFX: '/agent/effects/remove',
    },
  };
}

export function addActiveAgent(state, agent, score, lineOffset) {
  const acs = [];
  const existing = state.agents[agent.name];
  if (existing) {
    acs.push(editorAction(actions.LOWLIGHTLINE, [existing.agent.line]));
  }
  agent.line = agent.line + lineOffset;
  score.line = score.line + lineOffset;
  state.agents[agent.name] = {
    agent,
    score,
  };
  acs.push(editorAction(actions.HIGHLIGHTLINE, [agent.line]));
  return acs;
}

export function deactivateAgent(state, agentName) {
  const acs = [];
  const existing = state.agents[agentName];
  if (existing) {
    acs.push(editorAction(actions.LOWLIGHTLINE, [existing.agent.line]));
    delete state.agents[agentName];
  }
  return acs;
}

export function updateAgentPosition(state, agentName, newLine) {
  const acs = [];
  const existing = state.agents[agentName];
  if (existing) {
    const prevLine = existing.agent.line;
    existing.agent.line = newLine;
    existing.score.line = newLine;
    acs.push(editorAction(actions.HIGHLIGHTLINE, [existing.agent.line]));
    acs.push(editorAction(actions.NORMLIGHTLINE, [prevLine]));
  }
  return acs;
}

// the updater function gets given the score string for an agent
// and needs to return a new score string
// this will be used to create the new line of text that will be
// given to the editor as well as re-evaluating the agent with the
// new score
export function updateAgentScore(state, agentName, updater) {
  const existing = state.agents[agentName];
  if (!existing) {
    throw new AtomiixRuntimeError(`No agent called ${agentName}`);
  }
  return updater(existing.score);
}
