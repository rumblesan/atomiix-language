import { AtomiixRuntimeError } from '../runtime';

import scales from '../../music/scales';

import * as stdlib from '../stdlib';

import { MarkAgent, UnmarkAgent } from '../../transport/editor';

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
    MarkAgent(
      agent.name,
      agent.line - 1,
      agent.position - 1,
      agent.position - 1 + agent.name.length - 1,
      score.position - 1,
      score.position - 1 + score.scoreString.length
    )
  );
  return acs;
}

export function deactivateAgent(state, agentName) {
  const acs = [];
  const existing = state.agents[agentName];
  if (existing) {
    acs.push(UnmarkAgent(existing.agent.name));
    delete state.agents[agentName];
  }
  return acs;
}
