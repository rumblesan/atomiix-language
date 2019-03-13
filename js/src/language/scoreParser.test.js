import { scoreParser, scoreModifierParser } from './scoreParser';

import * as ast from '../ast';
import * as astTypes from '../ast/types';

test('parses a percussive score', () => {
  const score = { content: '|  a b  cd  |', line: 0, character: 0 };
  const seq = scoreParser('', score, []);
  const expected = ast.Score(
    astTypes.PERCUSSIVE,
    null,
    ['a', 'b', 'c', 'd'],
    [2, 3, 1, 3],
    2,
    [],
    '|  a b  cd  |',
    0,
    0
  );
  expect(seq).toEqual(expected);
});

test('parses a melodic score', () => {
  const score = { content: '[  1 3  57  ]', line: 0, character: 0 };
  const seq = scoreParser('foo', score, []);
  const expected = ast.Score(
    astTypes.MELODIC,
    'foo',
    [1, 3, 5, 7],
    [2, 3, 1, 3],
    2,
    [],
    '[  1 3  57  ]',
    0,
    0
  );
  expect(seq).toEqual(expected);
});

test('parses a concrete score', () => {
  const score = { content: '{  1 3  57  }', line: 0, character: 0 };
  const seq = scoreParser('foo', score, []);
  const expected = ast.Score(
    astTypes.CONCRETE,
    'foo',
    [1, 3, 5, 7],
    [2, 3, 1, 3],
    2,
    [],
    '{  1 3  57  }',
    0,
    0
  );
  expect(seq).toEqual(expected);
});

test('parses a panning score modifier', () => {
  const smString = '<1357>';
  const modifier = scoreModifierParser(smString);
  const expected = ast.ScoreModifier(astTypes.PANNING, [1, 3, 5, 7]);
  expect(modifier).toEqual(expected);
});

test('parses an attack score modifier', () => {
  const smString = '^1358^';
  const modifier = scoreModifierParser(smString);
  const expected = ast.ScoreModifier(astTypes.ATTACK, [1, 3, 5, 8]);
  expect(modifier).toEqual(expected);
});
