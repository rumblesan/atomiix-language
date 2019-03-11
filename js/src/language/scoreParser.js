import { ParserException } from 'canto34';

import * as ast from '../ast';
import * as astTypes from '../ast/types';

// TODO
// use modifiers
export function scoreParser(instrument, score, modifiers) {
  const scoreString = score.content;
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
  let scoreStringData;
  switch (first) {
    case '|':
      if (instrument) {
        throw new ParserException(
          `Percussive score shouldn't have instrument: ${instrument}`
        );
      }
      scoreStringData = scoreStringParser(scoreChars);
      return ast.Score(
        astTypes.PERCUSSIVE,
        null,
        scoreStringData.chars,
        scoreStringData.durations,
        scoreStringData.offset,
        modifiers,
        score.line,
        score.character
      );
    case '[':
      if (!instrument) {
        throw new ParserException('Melodic score should have an instrument');
      }
      scoreStringData = scoreStringParser(scoreChars);
      return ast.Score(
        astTypes.MELODIC,
        instrument,
        scoreStringData.chars.map(n => parseInt(n, 10)),
        scoreStringData.durations,
        scoreStringData.offset,
        modifiers,
        score.line,
        score.character
      );
    case '{':
      if (!instrument) {
        throw new ParserException('Concrete score should have an instrument');
      }
      scoreStringData = scoreStringParser(scoreChars);
      return ast.Score(
        astTypes.CONCRETE,
        instrument,
        scoreStringData.chars.map(n => parseInt(n, 10)),
        scoreStringData.durations,
        scoreStringData.offset,
        modifiers,
        score.line,
        score.character
      );
    default:
      throw new ParserException(`${first} is not a supported score delimiters`);
  }
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
