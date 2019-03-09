import {
  PROGRAM,
  PLAY,
  FXCHAIN,
  AGENT,
  SCORE,
  PERCUSSIVE,
  MELODIC,
  CONCRETE,
  SCOREOPERATOR,
  SCOREMODIFIER,
  SUSTAIN,
  EFFECT,
} from './types';

/**
 *  value: [Statement]
 */
export function Program(statements) {
  return {
    type: PROGRAM,
    statements,
  };
}

/**
 *  agent: Agent
 *  score: Score
 */
export function Play(agent, score) {
  return {
    type: PLAY,
    agent,
    score,
  };
}

/**
 *  agent: Agent
 *  effects: [Effect]
 */
export function FXChain(agent, effects) {
  return {
    type: FXCHAIN,
    agent,
    effects,
  };
}

/**
 *  name: Identifier
 */
export function Agent(name) {
  return {
    type: AGENT,
    name,
  };
}

/**
 *  scoreType: string
 *  instrument: string | undefined
 *  values: [string] | [integer]
 *  durations: [integer]
 *  offset: integer
 *  modifiers: [ScoreOperator | ScoreModifer]
 */
export function Score(
  scoreType,
  instrument,
  values,
  durations,
  offset,
  modifiers
) {
  return {
    type: SCORE,
    scoreType,
    instrument,
    values,
    durations,
    offset,
    modifiers,
  };
}

/**
 *  notes: [integer]
 *  durations: [integer]
 *  instruments: [string]
 *  sustain: [integer]
 *  attack: [integer]
 *  panning: [integer]
 *  offset: integer
 *  repeats: integer | string
 */
export function PercussiveScore(
  notes,
  durations,
  instruments,
  sustain,
  attack,
  panning,
  offset,
  repeats
) {
  return {
    type: SCORE,
    scoreType: PERCUSSIVE,
    notes,
    durations,
    instruments,
    sustain,
    attack,
    panning,
    offset,
    repeats,
  };
}

/**
 *  notes: [integer]
 *  durations: [integer]
 *  instrument: string
 *  sustain: [integer]
 *  attack: [integer]
 *  panning: [integer]
 *  offset: integer
 *  repeats: integer | string
 */
export function MelodicScore(
  notes,
  durations,
  instrument,
  sustain,
  attack,
  panning,
  offset,
  repeats
) {
  return {
    type: SCORE,
    scoreType: MELODIC,
    notes,
    durations,
    instrument,
    sustain,
    attack,
    panning,
    offset,
    repeats,
  };
}

/**
 *  pitch: integer // TODO might be a float?
 *  amplitudes: [integer] // TODO might be floats?
 *  durations: [integer]
 *  instrument: string
 *  panning: [integer]
 *  offset: integer
 *  repeats: integer | string
 */
export function ConcreteScore(
  pitch,
  amplitudes,
  durations,
  instrument,
  panning,
  offset,
  repeats
) {
  return {
    type: SCORE,
    scoreType: CONCRETE,
    pitch,
    amplitudes,
    durations,
    instrument,
    panning,
    offset,
    repeats,
  };
}

/**
 *  operator: string
 *  value: float
 */
export function ScoreOperator(operator, value) {
  return {
    type: SCOREOPERATOR,
    operator,
    value,
  };
}

/**
 *  modifierType: ScoreModifier
 *  values: [integer]
 */
export function ScoreModifier(modifierType, values) {
  return {
    type: SCOREMODIFIER,
    modifierType,
    values,
  };
}

/**
 *  noteLength: integer
 *  multiplier: integer
 */
export function ScoreSustainModifier(noteLength, multiplier) {
  return {
    type: SCOREMODIFIER,
    modifierType: SUSTAIN,
    noteLength,
    multiplier,
  };
}

/**
 *  name: Identifier
 */
export function Effect(name) {
  return {
    type: EFFECT,
    name,
  };
}
