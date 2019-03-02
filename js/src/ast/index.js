import {
  PROGRAM,
  PLAY,
  FXCHAIN,
  AGENT,
  SCORE,
  SCOREOPERATOR,
  SCOREMODIFIER,
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
 *  scoreType: ScoreType
 *  instruments: [string]
 *  notes: [string | integer]
 *  durations: [integer]
 *  offset: integer
 */
export function Score(
  scoreType,
  instruments,
  notes,
  durations,
  offset,
  sustain,
  panning
) {
  return {
    type: SCORE,
    scoreType,
    instruments,
    notes,
    durations,
    offset,
    sustain: sustain || [],
    panning: panning || [],
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
 *  name: Identifier
 */
export function Effect(name) {
  return {
    type: EFFECT,
    name,
  };
}
