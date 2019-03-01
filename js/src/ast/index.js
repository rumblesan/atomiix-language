import {
  PROGRAM,
  PLAY,
  FXCHAIN,
  AGENT,
  PATTERN,
  SEQUENCE,
  SEQEFFECT,
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
 *  pattern: Pattern
 */
export function Play(agent, pattern) {
  return {
    type: PLAY,
    agent,
    pattern,
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
 *  sequence: Sequence
 *  effects: SequenceEffects
 */
export function Pattern(sequence, effects) {
  return {
    type: PATTERN,
    sequence,
    effects,
  };
}

/**
 *  seqType: SequenceType
 *  instruments: [string]
 *  notes: [string | integer]
 *  durations: [integer]
 *  offset: integer
 */
export function Sequence(seqType, instruments, notes, durations, offset) {
  return {
    type: SEQUENCE,
    seqType,
    instruments,
    notes,
    durations,
    offset,
  };
}

/**
 *  eType: EffectType
 *  eString: string
 */
export function SequenceEffect(eType, eString) {
  return {
    type: SEQEFFECT,
    eType,
    eString,
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
