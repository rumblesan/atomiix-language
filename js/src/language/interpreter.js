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
    },
  };
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
    default:
      throw new AtomiixRuntimeError(
        `${statementAST.type} is not a supported statement type`
      );
  }
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
  const { notes, sustain, attack, panning, repeats } = interpretModifiers(
    state,
    scoreNotes,
    score.modifiers
  );
  const durations = score.durations;
  const instruments = score.values;
  const offset = score.offset;

  const ps = ast.PercussiveScore(
    notes,
    durations,
    instruments,
    sustain,
    attack,
    panning,
    offset,
    repeats
  );
  const msg = osc.playStmtToOSC(state.oscAddresses.playPattern, agent, ps);
  return [msg];
}

export function interpretMelodicScore(state, agent, score) {
  const scoreNotes = score.values.map(i => intervalToNote(state, i));
  const { notes, sustain, attack, panning, repeats } = interpretModifiers(
    state,
    scoreNotes,
    score.modifiers
  );
  const durations = score.durations;
  const instrument = score.instrument;
  const offset = score.offset;

  const ms = ast.MelodicScore(
    notes,
    durations,
    instrument,
    sustain,
    attack,
    panning,
    offset,
    repeats
  );
  const msg = osc.playStmtToOSC(state.oscAddresses.playPattern, agent, ms);
  return [msg];
}

export function interpretConcreteScore(state, agent, score) {
  // TODO should this be a float?
  const pitch = 60;
  const { panning, repeats } = interpretModifiers(state, [], score.modifiers);
  const amplitudes = score.values.map(v => v / 10);
  const durations = score.durations;
  const instrument = score.instrument;
  const offset = score.offset;

  const ms = ast.ConcreteScore(
    pitch,
    amplitudes,
    durations,
    instrument,
    panning,
    offset,
    repeats
  );
  const msg = osc.playStmtToOSC(state.oscAddresses.playPattern, agent, ms);
  return [msg];
}

export function interpretModifiers(state, scoreNotes, modifiers) {
  let notes = scoreNotes;
  let sustain = [4];
  let attack = [5];
  let panning = [5];
  let repeats = 'inf';
  for (let i = 0; i < modifiers.length; i += 1) {
    const m = modifiers[i];
    if (m.type === astTypes.SCOREMODIFIER) {
      switch (m.modifierType) {
        case astTypes.PANNING:
          panning = m.values;
          break;
        case astTypes.SUSTAIN:
          sustain = m.values;
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
      }
    }
  }
  return {
    notes,
    sustain: sustain.map(n => 1 / n),
    attack: attack.map(n => n / 9),
    panning: panning.map(n => (n - 1) / 4 - 1),
    repeats,
  };
}
