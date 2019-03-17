import parser from './parser';

import * as ast from '../ast';

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
