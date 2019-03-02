import { ParserException } from 'canto34';

import * as ast from '../ast';
import * as astTypes from '../ast/types';

// TODO
// use modifiers
export function scoreParser(instrument, scoreString, modifiers) {
  const first = scoreString.charAt(0);
  const last = scoreString.slice(-1);

  let matched = false;
  switch (first) {
    case '|':
      matched = last === '|';
      break;
    case '[':
      matched = last === ']';
      break;
    case '{':
      matched = last === '}';
      break;
  }
  if (!matched) {
    throw new ParserException(
      `Score delimiters don't match. Starts with ${first} but ends with ${last}`
    );
  }

  const scoreChars = scoreString.slice(1, -1);
  switch (first) {
    case '|':
      if (instrument) {
        throw new ParserException(
          `Percussive score shouldn't have instrument: ${instrument}`
        );
      }
      return parsePercussiveScore(scoreChars, modifiers);
    case '[':
      return parseMelodicScore(instrument, scoreChars, modifiers);
    case '{':
      return parseConcreteScore(instrument, scoreChars, modifiers);
    default:
      throw new ParserException(`${first} is not a supported score delimiters`);
  }
}

export function parsePercussiveScore(scoreChars, modifiers) {
  const scoreType = astTypes.PERCUSSIVE;
  const { chars, durations, offset } = scoreStringParser(scoreChars);
  const instruments = chars;
  const notes = Array(chars.length).fill(60);
  return applyModifiers(
    scoreType,
    notes,
    durations,
    instruments,
    offset,
    modifiers
  );
}

export function parseMelodicScore(instrument, scoreChars, modifiers) {
  const scoreType = astTypes.MELODIC;
  const { chars, durations, offset } = scoreStringParser(scoreChars);
  const notes = chars.map(c => parseInt(c, 10));
  return applyModifiers(
    scoreType,
    notes,
    durations,
    [instrument],
    offset,
    modifiers
  );
}

export function parseConcreteScore(instrument, scoreChars, modifiers) {
  const scoreType = astTypes.CONCRETE;
  const { chars, durations, offset } = scoreStringParser(scoreChars);
  const notes = chars.map(c => parseInt(c, 10));
  return applyModifiers(
    scoreType,
    notes,
    durations,
    [instrument],
    offset,
    modifiers
  );
}

export function applyModifiers(
  scoreType,
  notes,
  durations,
  instruments,
  offset,
  modifiers
) {
  let sustain = [];
  let attack = [];
  let panning = [];
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
  return ast.Score(
    scoreType,
    notes,
    durations,
    instruments,
    sustain,
    attack,
    panning,
    offset,
    repeats
  );
}

export function scoreStringParser(scoreChars) {
  const chars = [];
  const durations = [];
  let offset = 0;

  let current = '';
  let spaces = 0;

  for (let i = 0; i < scoreChars.length; i += 1) {
    const c = scoreChars[i];
    if (c === ' ') {
      spaces += 1;
      continue;
    }
    if (current === '') {
      offset = spaces;
    } else {
      chars.push(current);
      durations.push(spaces);
    }
    current = c;
    spaces = 1;
  }

  if (current != '') {
    chars.push(current);
    durations.push(spaces);
  }
  return {
    chars,
    durations,
    offset,
  };
}

export function scoreModifierParser(modifier) {
  const first = modifier.charAt(0);
  const last = modifier.slice(-1);

  let modifierType;
  let matched = false;
  switch (first) {
    case '<':
      modifierType = astTypes.PANNING;
      matched = last === '>';
      break;
    case '^':
      modifierType = astTypes.ATTACK;
      matched = last === '^';
      break;
  }
  if (!matched) {
    throw new ParserException(
      `Score modifier delimiters don't match. Starts with ${first} but ends with ${last}`
    );
  }

  const smString = modifier.slice(1, -1);
  const values = smString.split('').map(c => parseInt(c, 10));

  return ast.ScoreModifier(modifierType, values);
}
