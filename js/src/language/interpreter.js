import scales from '../music/scales';
import * as ast from '../ast';
import * as astTypes from '../ast/types';
import * as osc from '../transport/osc';

class AtomiixRuntimeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AtomiixRuntimeError';
  }
}

export function intervalToNote(state, interval) {
  return state.tonic + scales.notes[state.scale][interval];
}

export function createState() {
  return {
    scale: scales.names.Maj,
    tonic: 60,
    oscAddresses: {
      playPattern: '/play/pattern',
      freeAgent: '/free',
      addFX: '/agent/effects/add',
      rmFX: '/agent/effects/remove',
    },
  };
}

export function freeAgents(state, programAST) {
  const { agentNames } = getAgentNames(state, programAST);
  const messages = agentNames.map(n =>
    osc.freeAgentToOSC(state.oscAddresses.freeAgent, n)
  );
  return {
    newState: state,
    messages,
  };
}

export function getAgentNames(state, programAST) {
  let agentNames = [];
  for (let i = 0; i < programAST.statements.length; i += 1) {
    const s = programAST.statements[i];
    const agent = getStatementAgent(state, s);
    if (agent) {
      agentNames.push(agent.name);
    }
  }
  return {
    newState: state,
    agentNames,
  };
}

export function getStatementAgent(state, statementAST) {
  switch (statementAST.type) {
    case astTypes.PLAY:
      return statementAST.agent;
    default:
      return null;
  }
}

// Turns a program AST into a new state object and
// a series of OSC messages
export function interpret(state, programAST) {
  let messages = [];
  for (let i = 0; i < programAST.statements.length; i += 1) {
    const s = programAST.statements[i];
    const outputMsgs = interpretStatement(state, s);
    if (outputMsgs) {
      messages = messages.concat(outputMsgs);
    }
  }
  return {
    newState: state,
    messages,
  };
}

export function interpretStatement(state, statementAST) {
  switch (statementAST.type) {
    case astTypes.PLAY:
      return interpretPlay(state, statementAST);
    case astTypes.ADDFXCHAIN:
      return interpretAddFX(state, statementAST);
    case astTypes.RMFXCHAIN:
      return interpretRemoveFX(state, statementAST);
    default:
      throw new AtomiixRuntimeError(
        `${statementAST.type} is not a supported statement type`
      );
  }
}

export function interpretAddFX(state, { agent, effects }) {
  return [osc.fxChainToOSC(state.oscAddresses.addFX, agent, effects)];
}

export function interpretRemoveFX(state, { agent, effects }) {
  return [osc.fxChainToOSC(state.oscAddresses.rmFX, agent, effects)];
}

export function interpretPlay(state, { agent, score }) {
  // TODO save score against agent in state
  const scoreType = score.scoreType;
  switch (scoreType) {
    case astTypes.PERCUSSIVE:
      return interpretPercussiveScore(state, agent, score);
    case astTypes.MELODIC:
      return interpretMelodicScore(state, agent, score);
    case astTypes.CONCRETE:
      return interpretConcreteScore(state, agent, score);
    default:
      throw new AtomiixRuntimeError(
        `${scoreType} is not a supported score type`
      );
  }
}

export function interpretPercussiveScore(state, agent, score) {
  // TODO does note pull anything from the default state tonic?
  const scoreNotes = [60];
  const {
    notes,
    durations,
    sustain,
    attack,
    panning,
    repeats,
  } = interpretModifiers(state, scoreNotes, score.durations, score.modifiers);
  const instruments = score.values;
  const quantphase = score.offset / 4;

  const ps = ast.PercussiveScore(
    notes,
    durations,
    instruments,
    sustain,
    attack,
    panning,
    quantphase,
    repeats
  );
  const msg = osc.playStmtToOSC(state.oscAddresses.playPattern, agent, ps);
  return [msg];
}

export function interpretMelodicScore(state, agent, score) {
  const scoreNotes = score.values.map(i => intervalToNote(state, i));
  const {
    notes,
    durations,
    sustain,
    attack,
    panning,
    repeats,
  } = interpretModifiers(state, scoreNotes, score.durations, score.modifiers);
  const instrument = score.instrument;
  const quantphase = score.offset / 4;

  const ms = ast.MelodicScore(
    notes,
    durations,
    instrument,
    sustain,
    attack,
    panning,
    quantphase,
    repeats
  );
  const msg = osc.playStmtToOSC(state.oscAddresses.playPattern, agent, ms);
  return [msg];
}

export function interpretConcreteScore(state, agent, score) {
  // TODO should this be a float?
  const pitch = 60;
  const { durations, panning, repeats } = interpretModifiers(
    state,
    [],
    score.durations,
    score.modifiers
  );
  const amplitudes = score.values.map(v => v / 10);
  const instrument = score.instrument;
  const quantphase = score.offset / 4;

  const ms = ast.ConcreteScore(
    pitch,
    amplitudes,
    durations,
    instrument,
    panning,
    quantphase,
    repeats
  );
  const msg = osc.playStmtToOSC(state.oscAddresses.playPattern, agent, ms);
  return [msg];
}

export function interpretModifiers(
  state,
  scoreNotes,
  scoreDurations,
  modifiers
) {
  let notes = scoreNotes;
  let durations = scoreDurations;
  let sustain = [1 / 4];
  let attack = [5];
  let panning = [0];
  let timestretch = 1;
  let silences = 0;
  let repeats = 'inf';
  for (let i = 0; i < modifiers.length; i += 1) {
    const m = modifiers[i];
    if (m.type === astTypes.SCOREMODIFIER) {
      switch (m.modifierType) {
        case astTypes.PANNING:
          panning = m.values.map(n => (n - 1) / 4 - 1);
          break;
        case astTypes.SUSTAIN:
          sustain = [(1 / m.noteLength) * m.multiplier];
          break;
        case astTypes.ATTACK:
          attack = m.values;
          break;
      }
    } else if (m.type === astTypes.SCOREOPERATOR) {
      // TODO handle * and / operators
      switch (m.operator) {
        case '+':
          notes = notes.map(n => n + m.value);
          break;
        case '-':
          notes = notes.map(n => n - m.value);
          break;
        case '*':
          timestretch = m.value;
          break;
        case '/':
          timestretch = 1 / m.value;
          break;
        case '!':
          silences = m.value;
          break;
        case '@':
          repeats = m.value;
          break;
      }
    }
  }
  // add silence onto last duration
  durations[durations.length - 1] += silences;
  // make everything quarter notes
  // then multiply my timestretch
  durations = durations.map(n => n / 4).map(n => n * timestretch);
  attack = attack.map(n => n / 9);
  return {
    notes,
    durations,
    sustain,
    attack,
    panning,
    silences,
    timestretch,
    repeats,
  };
}
