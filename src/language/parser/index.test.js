import parser from './index';

import * as ast from '../ast';
import * as astTypes from '../ast/types';

parser.setLanguage('english');

test('parses a command', () => {
  const program = 'tempo 120';
  const seq = parser.parse(program);
  const expected = ast.Program([ast.Command('tempo', [ast.Num(120)], 0, 0)]);
  expect(seq).toEqual(expected);
});

test('parses a number with a modifier', () => {
  const program = 'tempo 120:5';
  const seq = parser.parse(program);
  const expected = ast.Program([ast.Command('tempo', [ast.Num(120, 5)], 0, 0)]);
  expect(seq).toEqual(expected);
});

test('parses a future', () => {
  // this isn't a real program, but should be fine for the moment
  const program = 'future 1 >> )) baz';
  const seq = parser.parse(program);
  const command = ast.IncreaseAmplitude(ast.Agent('baz', 0, 15));
  const expected = ast.Program([
    ast.Future(ast.Num(1), command, {
      line: 0,
      character: 0,
    }),
  ]);
  expect(seq).toEqual(expected);
});

test('parses a future with a beat', () => {
  // this isn't a real program, but should be fine for the moment
  const program = 'future 1b >> shake baz';
  const seq = parser.parse(program);
  const command = ast.Command('shake', [ast.Str('baz')], 0, 13);
  const expected = ast.Program([
    ast.Future(ast.Beat(1), command, {
      line: 0,
      character: 0,
    }),
  ]);
  expect(seq).toEqual(expected);
});

test('parses a future with a modifier', () => {
  // this isn't a real program, but should be fine for the moment
  const program = 'future 1b:3 >> shake baz';
  const seq = parser.parse(program);
  const command = ast.Command('shake', [ast.Str('baz')], 0, 15);
  const expected = ast.Program([
    ast.Future(ast.Beat(1, 3), command, {
      line: 0,
      character: 0,
    }),
  ]);
  expect(seq).toEqual(expected);
});

test('parses a beat', () => {
  // this isn't a real program, but should be fine for the moment
  const program = 'tempo 120b';
  const seq = parser.parse(program);
  const expected = ast.Program([ast.Command('tempo', [ast.Beat(120)], 0, 0)]);
  expect(seq).toEqual(expected);
});

test('parses a beat with a modifier', () => {
  // this isn't a real program, but should be fine for the moment
  const program = 'tempo 120b:6';
  const seq = parser.parse(program);
  const expected = ast.Program([
    ast.Command('tempo', [ast.Beat(120, 6)], 0, 0),
  ]);
  expect(seq).toEqual(expected);
});

test('parses an agent with a score', () => {
  // this isn't a real program, but should be fine for the moment
  const program = 'jimi -> guitar[1 2 3 4 ]+12';
  const seq = parser.parse(program);
  const expected = ast.Program([
    ast.Play(
      ast.Agent('jimi', 0, 0),
      ast.Score(
        astTypes.MELODIC,
        'guitar',
        [1, 2, 3, 4],
        [2, 2, 2, 2],
        0,
        [ast.ScoreOperator('+', 12)],
        '[1 2 3 4 ]',
        0,
        14
      )
    ),
  ]);
  expect(seq).toEqual(expected);
});

test('parses an agent with score modifiers', () => {
  // this isn't a real program, but should be fine for the moment
  const program = 'jimi -> guitar[1 2 3 4 ]+12<12>';
  const seq = parser.parse(program);
  const expected = ast.Program([
    ast.Play(
      ast.Agent('jimi', 0, 0),
      ast.Score(
        astTypes.MELODIC,
        'guitar',
        [1, 2, 3, 4],
        [2, 2, 2, 2],
        0,
        [
          ast.ScoreOperator('+', 12),
          ast.ScoreModifier(astTypes.PANNING, [1, 2]),
        ],
        '[1 2 3 4 ]',
        0,
        14
      )
    ),
  ]);
  expect(seq).toEqual(expected);
});

test('parses a chord', () => {
  const program = 'a -> (357)';
  const seq = parser.parse(program);
  const expected = ast.Program([ast.Chord('a', [3, 5, 7])]);
  expect(seq).toEqual(expected);
});
