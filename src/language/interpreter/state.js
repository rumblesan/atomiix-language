import { AgentState, agentStates } from './agents.js';
import { AtomiixRuntimeError } from '../errors/index.js';
import scales from '../../music/scales.js';
import translations from '../../translations/index.js';
import stdlib from '../stdlib/index.js';
import { MarkAgent } from '../../actions/editor/index.js';

export function createLogger() {
  return {
    info: console.log,
    warn: console.log,
    error: console.log,
  };
}

export function create(logger, lang) {
  const l = logger || createLogger();
  const language = lang || 'english';
  return {
    scale: scales.names.major,
    tonic: 60,
    bpm: 120,
    stdlib,
    agents: {},
    groups: {},
    chords: {},
    callbacks: {},
    lastCallbackID: 0,
    logger: l,
    language,
    translation: translations[language].interpreter,
  };
}

export function getAgentInfo(state, agentName) {
  const existing = state.agents[agentName];
  if (!existing) {
    throw new AtomiixRuntimeError(state.translation.errors.noAgent(agentName));
  }
  return existing;
}

export function addActiveAgent(state, agent, score, lineOffset) {
  if (state.groups[agent.name]) {
    throw new AtomiixRuntimeError(
      state.translation.errors.groupExists(agent.name)
    );
  }
  const acs = [];
  agent.line += lineOffset;
  score.line += lineOffset;
  state.agents[agent.name] = AgentState(
    agent,
    score,
    true,
    0.5,
    agentStates.PLAYING
  );
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
    existing.playing = false;
    existing.state = agentStates.STOPPED;
    //delete state.agents[agentName];
  }
  return acs;
}

export function stopAgent(state, agentName) {
  const acs = [];
  const existing = state.agents[agentName];
  if (existing) {
    existing.playing = false;
  }
  return acs;
}

export function setChord(state, name, notes) {
  state.chords[name] = notes;
}

export function getChord(state, name) {
  if (state.chords[name]) {
    return state.chords[name];
  }
  throw new AtomiixRuntimeError(
    state.translation.errors.chordDoesntExist(name)
  );
}
