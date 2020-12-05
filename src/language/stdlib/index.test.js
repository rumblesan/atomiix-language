import atomiix from '../../index.js';

import * as th from '../../test-helpers';
import { ReplaceScore, MarkAgent } from '../../actions/editor';

test('can reverse an agents score', () => {
  const program = 'baz -> |  a b  c|\nreverse baz';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 3 / 4],
      ['a', 'b', 'c'],
      0,
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      'inf'
    ),
    th.createPercussiveMsg(
      'baz',
      [60],
      [3 / 4, 2 / 4, 3 / 4],
      ['c', 'b', 'a'],
      0,
      [0.25],
      [5 / 9],
      [0],
      0,
      'inf'
    ),
  ];
  const expectedActions = [
    MarkAgent('baz', 0, 0, 3, 7, 17),
    ReplaceScore('baz', '|c  b a  |'),
  ];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can right shift an agents score', () => {
  const program = 'baz -> |  a b  c|\nshiftr baz 2';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 3 / 4],
      ['a', 'b', 'c'],
      0,
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      'inf'
    ),
    th.createPercussiveMsg(
      'baz',
      [60],
      [3 / 4, 2 / 4, 3 / 4],
      ['c', 'a', 'b'],
      0,
      [0.25],
      [5 / 9],
      [0],
      1 / 4,
      'inf'
    ),
  ];
  const expectedActions = [
    MarkAgent('baz', 0, 0, 3, 7, 17),
    ReplaceScore('baz', '| c  a b |'),
  ];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can left shift an agents score', () => {
  const program = 'baz -> |  a b  c|\nshiftl baz 2';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 3 / 4],
      ['a', 'b', 'c'],
      0,
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      'inf'
    ),
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 3 / 4],
      ['a', 'b', 'c'],
      0,
      [0.25],
      [5 / 9],
      [0],
      0,
      'inf'
    ),
  ];
  const expectedActions = [
    MarkAgent('baz', 0, 0, 3, 7, 17),
    ReplaceScore('baz', '|a b  c  |'),
  ];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can yoyo an agents score', () => {
  const program = 'baz -> |D a b  c|\nyoyo baz 2';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 2 / 4, 3 / 4, 1 / 4],
      ['D', 'a', 'b', 'c'],
      0,
      [0.25],
      [5 / 9],
      [0],
      0,
      'inf'
    ),
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 2 / 4, 3 / 4, 1 / 4],
      ['d', 'A', 'B', 'C'],
      0,
      [0.25],
      [5 / 9],
      [0],
      0,
      'inf'
    ),
  ];
  const expectedActions = [
    MarkAgent('baz', 0, 0, 3, 7, 17),
    ReplaceScore('baz', '|d A B  C|'),
  ];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can order an agents score', () => {
  const program = 'baz -> |d a C  b|\norder baz';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 2 / 4, 3 / 4, 1 / 4],
      ['d', 'a', 'C', 'b'],
      0,
      [0.25],
      [5 / 9],
      [0],
      0,
      'inf'
    ),
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 2 / 4, 3 / 4, 1 / 4],
      ['C', 'a', 'b', 'd'],
      0,
      [0.25],
      [5 / 9],
      [0],
      0,
      'inf'
    ),
  ];
  const expectedActions = [
    MarkAgent('baz', 0, 0, 3, 7, 17),
    ReplaceScore('baz', '|C a b  d|'),
  ];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can invert an agents score', () => {
  const program = 'baz -> harp[1 7 3  5]\ninvert baz';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createMelodicMsg(
      'baz',
      [60, 71, 64, 67],
      [2 / 4, 2 / 4, 3 / 4, 1 / 4],
      'harp',
      [0.25],
      [5 / 9],
      [0],
      0,
      'inf'
    ),
    th.createMelodicMsg(
      'baz',
      [71, 60, 67, 64],
      [2 / 4, 2 / 4, 3 / 4, 1 / 4],
      'harp',
      [0.25],
      [5 / 9],
      [0],
      0,
      'inf'
    ),
  ];
  const expectedActions = [
    MarkAgent('baz', 0, 0, 3, 11, 21),
    ReplaceScore('baz', '[7 1 5  3]'),
  ];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can kill all agents', () => {
  const program = 'baz -> |D a b  c|\nfoo -> bass[12]\nbar -> |aaa|';
  const initialState = atomiix.init();
  atomiix.evaluate(initialState, program);
  const { audio, editor } = atomiix.evaluate(initialState, 'kill');
  const expectedMessages = [
    th.createFreeAgentMsg('baz'),
    th.createFreeAgentMsg('foo'),
    th.createFreeAgentMsg('bar'),
  ];
  const expectedActions = [];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});
