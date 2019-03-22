import atomiix from '../../index.js';

import * as th from '../../test-helpers';
import { ReplaceScore, MarkAgent, UnmarkAgent } from '../../actions/editor';

test('can reverse an agents score', () => {
  const program = 'baz -> |  a b  c|\nreverse baz';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 1 / 4],
      ['a', 'b', 'c'],
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
      [2 / 4, 3 / 4, 1 / 4],
      ['a', 'b', 'c'],
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      'inf'
    ),
    th.createPercussiveMsg(
      'baz',
      [60],
      [3 / 4, 2 / 4, 2 / 4],
      ['c', 'a', 'b'],
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
      [2 / 4, 3 / 4, 1 / 4],
      ['a', 'b', 'c'],
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
