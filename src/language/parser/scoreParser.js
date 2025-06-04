import { ParserException } from '@rumblesan/virgil';

import * as ast from '../ast/index.js';
import * as astTypes from '../ast/types.js';

// TODO
// use modifiers
export function scoreParser(translation, instrument, score, modifiers) {
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
      translation.errors.nonMatchedScoreDelims(first, last)
    );
  }

  const scoreChars = scoreString.slice(1, -1);
  let scoreStringData;
  switch (first) {
    case '|':
      scoreStringData = scoreStringParser(scoreChars);
      return ast.Score(
        astTypes.PERCUSSIVE,
        instrument || 'bank0',
        scoreStringData.chars,
        scoreStringData.durations,
        scoreStringData.offset,
        modifiers,
        scoreString,
        score.line - 1,
        score.character - 1
      );
    case '[':
      if (!instrument) {
        throw new ParserException(translation.errors.missingMelodicInstrument);
      }
      scoreStringData = scoreStringParser(scoreChars);
      return ast.Score(
        astTypes.MELODIC,
        instrument,
        scoreStringData.chars.map((c) => {
          let v = parseInt(c, 10);
          if (isNaN(v)) {
            return c;
          }
          return v;
        }),
        scoreStringData.durations,
        scoreStringData.offset,
        modifiers,
        scoreString,
        score.line - 1,
        score.character - 1
      );
    case '{':
      if (!instrument) {
        throw new ParserException(translation.errors.missingConcreteInstrument);
      }
      scoreStringData = scoreStringParser(scoreChars);
      return ast.Score(
        astTypes.CONCRETE,
        instrument,
        scoreStringData.chars.map((n) => parseInt(n, 10)),
        scoreStringData.durations,
        scoreStringData.offset,
        modifiers,
        scoreString,
        score.line - 1,
        score.character - 1
      );
    default:
      throw new ParserException(
        translation.errors.invalidScoreDelimiter(first)
      );
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
    // add the duration of any beginning
    // spaces to the final chars duration
    durations.push(spaces + offset);
  }
  return {
    chars,
    durations,
    offset,
  };
}

export function scoreModifierParser(translation, modifier) {
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
      translation.errors.nonMatchedScoreModDelims(first, last)
    );
  }

  const smString = modifier.slice(1, -1);
  const values = smString.split('').map((c) => parseInt(c, 10));

  return ast.ScoreModifier(modifierType, values);
}
