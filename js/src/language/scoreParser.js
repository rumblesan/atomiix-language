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

  let score;
  const scoreChars = scoreString.slice(1, -1);
  switch (first) {
    case '|':
      if (instrument) {
        throw new ParserException(
          `Percussive score shouldn't have instrument: ${instrument}`
        );
      }
      score = parsePercussiveScore(scoreChars);
      break;
    case '[':
      score = parseMelodicScore(instrument, scoreChars);
      break;
    case '{':
      score = parseConcreteScore(instrument, scoreChars);
      break;
    default:
      throw new ParserException(`${first} is not a supported score delimiters`);
  }
  applyModifiers(score, modifiers);
  return score;
}

export function parsePercussiveScore(scoreChars) {
  const scoreType = astTypes.PERCUSSIVE;
  const { chars, durations, offset } = scoreStringParser(scoreChars);
  const instruments = chars;
  const notes = Array(chars.length).fill(60);
  return ast.Score(scoreType, instruments, notes, durations, offset);
}

export function parseMelodicScore(instrument, scoreChars) {
  const scoreType = astTypes.MELODIC;
  const { chars, durations, offset } = scoreStringParser(scoreChars);
  const notes = chars.map(c => parseInt(c, 10));
  return ast.Score(scoreType, [instrument], notes, durations, offset);
}

export function parseConcreteScore(instrument, scoreChars) {
  const scoreType = astTypes.CONCRETE;
  const { chars, durations, offset } = scoreStringParser(scoreChars);
  const notes = chars.map(c => parseInt(c, 10));
  return ast.Score(scoreType, [instrument], notes, durations, offset);
}

export function applyModifiers(score, modifiers) {
  for (let i = 0; i < modifiers.length; i += 1) {
    const m = modifiers[i];
    if (m.type === astTypes.SCOREMODIFIER) {
      switch (m.modifierType) {
        case astTypes.PANNING:
          score.panning = m.values;
          break;
        case astTypes.SUSTAIN:
          score.sustain = m.values;
          break;
      }
    } else if (m.type === astTypes.SCOREOPERATOR) {
      // TODO handle * and / operators
      switch (m.operator) {
        case '+':
          score.notes = score.notes.map(n => n + m.value);
          break;
        case '-':
          score.notes = score.notes.map(n => n - m.value);
          break;
      }
    }
  }
  return score;
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
      modifierType = astTypes.SUSTAIN;
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
