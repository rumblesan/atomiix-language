import { sequenceParser } from './patternParser';

import * as ast from '../ast';
import * as astTypes from '../ast/types';

test('parses a percussive sequence', () => {
  const seqString = '|  a b  cd  |';
  const seq = sequenceParser('', seqString);
  const expected = ast.Sequence(
    astTypes.PERCUSSIVE,
    ['a', 'b', 'c', 'd'],
    [60, 60, 60, 60],
    [2, 3, 1, 3],
    2
  );
  expect(seq).toEqual(expected);
});

test('parses a melodic sequence', () => {
  const seqString = '[  1 3  57  ]';
  const seq = sequenceParser('foo', seqString);
  const expected = ast.Sequence(
    astTypes.MELODIC,
    ['foo'],
    [1, 3, 5, 7],
    [2, 3, 1, 3],
    2
  );
  expect(seq).toEqual(expected);
});

test('parses a concrete sequence', () => {
  const seqString = '{  1 3  57  }';
  const seq = sequenceParser('foo', seqString);
  const expected = ast.Sequence(
    astTypes.CONCRETE,
    ['foo'],
    [1, 3, 5, 7],
    [2, 3, 1, 3],
    2
  );
  expect(seq).toEqual(expected);
});
