import { AtomiixRuntimeError } from '../runtime';

import scales from '../../music/scales';

import * as stdlib from '../stdlib';

import { MarkAgent, UnmarkAgent } from '../../transport/editor';

export function createLogger() {
  return {
    info: console.log, // eslint-disable-line no-console
    warning: console.log, // eslint-disable-line no-console
    error: console.log, // eslint-disable-line no-console
  };
}

export function create(logger) {
  const l = logger || createLogger();
  return {
    scale: scales.names.Maj,
    tonic: 60,
    stdlib,
    agents: {},
    oscAddresses: {
      playPattern: '/play/pattern',
      command: '/command',
      agentAmplitude: '/agent/amplitude',
      agentFinished: '/finished',
      addFX: '/agent/effects/add',
      rmFX: '/agent/effects/remove',
    },
    logger: l,
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
    playing: true,
    amplitude: 0.5,
  };
  acs.push(
    MarkAgent(
      agent.name,
      agent.line,
      agent.position,
      agent.position + agent.name.length,
      score.position,
      score.position + score.scoreString.length
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

export function stopAgent(state, agentName) {
  const existing = state.agents[agentName];
  if (existing) {
    existing.playing = false;
  }
}
