import {
  PROGRAM,
  PLAY,
  ADDFXCHAIN,
  RMFXCHAIN,
  INCRAMP,
  DECRAMP,
  COMMAND,
  FUTURE,
  GROUP,
  AGENT,
  SCORE,
  PERCUSSIVE,
  MELODIC,
  CONCRETE,
  SCOREOPERATOR,
  SCOREMODIFIER,
  SUSTAIN,
  EFFECT,
  BEAT,
  NUMBER,
  STRING,
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
export function AddFXChain(agent, effects) {
  return {
    type: ADDFXCHAIN,
    agent,
    effects,
  };
}

/**
 *  agent: Agent
 *  effects: [Effect]
 */
export function RemoveFXChain(agent, effects) {
  return {
    type: RMFXCHAIN,
    agent,
    effects,
  };
}

/**
 *  agent: Agent
 *  effects: [Effect]
 */
export function IncreaseAmplitude(agent) {
  return {
    type: INCRAMP,
    agent,
  };
}

/**
 *  agent: Agent
 *  effects: [Effect]
 */
export function DecreaseAmplitude(agent) {
  return {
    type: DECRAMP,
    agent,
  };
}

/**
 *  command: String
 *  args: [string | integer]
 *  line: integer
 *  position: integer
 */
export function Command(name, args, line, position) {
  return {
    type: COMMAND,
    name,
    args,
    line,
    position,
  };
}

/**
 *  timing: Number
 *  command: Command
 */
export function Future(timing, command, line) {
  return {
    type: FUTURE,
    timing,
    command,
    line,
  };
}

/**
 *  timing: Number
 *  command: Command
 */
export function Group(name, agents) {
  return {
    type: GROUP,
    name,
    agents,
  };
}

/**
 *  name: Identifier
 *  line: integer
 *  position: integer
 */
export function Agent(name, line, position) {
  return {
    type: AGENT,
    name,
    line,
    position,
  };
}

/**
 *  scoreType: string
 *  instrument: string | undefined
 *  values: [string] | [integer]
 *  durations: [integer]
 *  offset: integer
 *  modifiers: [ScoreOperator | ScoreModifer]
 *  scoreString: string
 *  line: integer
 *  position: integer
 */
export function Score(
  scoreType,
  instrument,
  values,
  durations,
  offset,
  modifiers,
  scoreString,
  line,
  position
) {
  return {
    type: SCORE,
    scoreType,
    instrument,
    values,
    durations,
    offset,
    modifiers,
    scoreString,
    line,
    position,
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

/**
 *  value: number
 *  modifier: number | undefined
 */
export function Beat(value, modifier) {
  return {
    type: BEAT,
    value,
    modifier,
  };
}

/**
 *  value: number
 *  modifier: number | undefined
 */
export function Num(value, modifier) {
  return {
    type: NUMBER,
    value,
    modifier,
  };
}

/**
 *  value: string
 */
export function Str(value) {
  return {
    type: STRING,
    value,
  };
}
