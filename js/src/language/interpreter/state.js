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

export function getAgentInfo(state, agentName) {
  const existing = state.agents[agentName];
  if (!existing) {
    throw new AtomiixRuntimeError(`No agent called ${agentName}`);
  }
  return existing;
}

export function addActiveAgent(state, agent, score, lineOffset) {
  const acs = [];
  agent.line = agent.line + lineOffset;
  score.line = score.line + lineOffset;
  state.agents[agent.name] = {
    agent,
    score,
  };
  acs.push(
    editorAction(actions.MARKAGENT, [
      agent.name,
      agent.line - 1,
      agent.position - 1,
      agent.position - 1 + agent.name.length - 1,
    ])
  );
  acs.push(
    editorAction(actions.MARKSCORE, [
      agent.name,
      score.line - 1,
      score.position - 1,
      score.position - 1 + score.scoreString.length,
    ])
  );
  return acs;
}

export function deactivateAgent(state, agentName) {
  const acs = [];
  const existing = state.agents[agentName];
  if (existing) {
    acs.push(editorAction(actions.UNMARKAGENT, [existing.agent.name]));
    delete state.agents[agentName];
  }
  return acs;
}

export function updateAgentPosition(state, agentName, newLine, newStart) {
  const acs = [];
  const existing = state.agents[agentName];
  if (existing) {
    existing.agent.line = newLine;
    existing.agent.position = newStart;
  }
  return acs;
}

export function updateScorePosition(state, agentName, newLine, newStart) {
  const acs = [];
  const existing = state.agents[agentName];
  if (existing) {
    existing.score.line = newLine;
    existing.score.position = newStart;
  }
  return acs;
}
