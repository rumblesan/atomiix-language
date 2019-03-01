import { ParserException } from 'canto34';

import * as ast from '../ast';
import * as astTypes from '../ast/types';

export function sequenceParser(instrument, sequence) {
  const first = sequence.charAt(0);
  const last = sequence.slice(-1);

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
      `Sequence delimiters don't match. Starts with ${first} but ends with ${last}`
    );
  }

  const seqString = sequence.slice(1, -1);

  switch (first) {
    case '|':
      if (instrument) {
        throw new ParserException(
          `Percussive sequence shouldn't have instrument: ${instrument}`
        );
      }
      return parsePercussivePattern(seqString);
    case '[':
      return parseMelodicPattern(instrument, seqString);
    case '{':
      return parseConcretePattern(instrument, seqString);
    default:
      throw new ParserException(
        `${first} is not a supported pattern delimiters`
      );
  }
}

export function parsePercussivePattern(seqString) {
  const seqType = astTypes.PERCUSSIVE;
  const { chars, durations, offset } = sequenceStringParser(seqString);
  const instruments = chars;
  const notes = Array(chars.length).fill(60);
  return ast.Sequence(seqType, instruments, notes, durations, offset);
}

export function parseMelodicPattern(instrument, seqString) {
  const seqType = astTypes.MELODIC;
  const { chars, durations, offset } = sequenceStringParser(seqString);
  const notes = chars.map(c => parseInt(c, 10));
  return ast.Sequence(seqType, [instrument], notes, durations, offset);
}

export function parseConcretePattern(instrument, seqString) {
  const seqType = astTypes.CONCRETE;
  const { chars, durations, offset } = sequenceStringParser(seqString);
  const notes = chars.map(c => parseInt(c, 10));
  return ast.Sequence(seqType, [instrument], notes, durations, offset);
}

export function sequenceStringParser(seqString) {
  const chars = [];
  const durations = [];
  let offset = 0;

  let current = '';
  let spaces = 0;

  for (let i = 0; i < seqString.length; i += 1) {
    const c = seqString[i];
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

export function sequenceEffectParser(seqEffectString) {
  return ast.SequenceEffect(astTypes.PANNING, seqEffectString);
}
