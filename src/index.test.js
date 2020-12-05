import atomiix from './index.js';

import * as th from './test-helpers';
import { ReplaceLine, MarkAgent } from './actions/editor';

test('basic end to end test', () => {
  const program =
    'baz -> |  a b  c|!8@2\nfoo -> harp[1  3 5]^23^+2(4~2)\nbar -> sea{ 2  6}<37>';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 11 / 4],
      ['a', 'b', 'c'],
      'bank',
      0,
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      2
    ),
    th.createMelodicMsg(
      'foo',
      [62, 66, 69],
      [3 / 4, 2 / 4, 1 / 4],
      'harp',
      [0.5],
      [2 / 9, 3 / 9],
      [0],
      0,
      'inf'
    ),
    th.createConcreteMsg(
      'bar',
      [0.2, 0.6],
      [3 / 4, 2 / 4],
      'sea',
      [-0.5, 0.5],
      1 / 4,
      'inf'
    ),
  ];
  const expectedActions = [
    MarkAgent('baz', 0, 0, 3, 7, 17),
    MarkAgent('foo', 1, 0, 3, 11, 19),
    MarkAgent('bar', 2, 0, 3, 10, 17),
  ];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can free agents', () => {
  const program =
    'baz -> |  a b  c|\nfoo -> harp[1  3 5]^23^+2\nbar -> sea{ 2  6}<37>';
  const initialState = atomiix.init();
  atomiix.evaluate(initialState, program);
  const { audio, editor } = atomiix.free(initialState, program);
  const expectedMessages = [
    th.createFreeAgentMsg('baz'),
    th.createFreeAgentMsg('foo'),
    th.createFreeAgentMsg('bar'),
  ];
  const expectedActions = [];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can add effects', () => {
  const program = 'baz -> |  a b  c|\nbaz >> reverb >> distortion';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 3 / 4],
      ['a', 'b', 'c'],
      'bank',
      0,
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      'inf'
    ),
    th.createAddFXMsg('baz', ['reverb', 'distortion']),
  ];
  const expectedActions = [MarkAgent('baz', 0, 0, 3, 7, 17)];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can remove effects', () => {
  const program = 'baz -> |  a b  c|\nbaz << reverb << distortion';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 3 / 4],
      ['a', 'b', 'c'],
      'bank',
      0,
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      'inf'
    ),
    th.createRemoveFXMsg('baz', ['reverb', 'distortion']),
  ];
  const expectedActions = [MarkAgent('baz', 0, 0, 3, 7, 17)];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can remove all effects', () => {
  const program = 'baz -> |  a b  c|\nbaz <<';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 3 / 4],
      ['a', 'b', 'c'],
      'bank',
      0,
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      'inf'
    ),
    th.createRemoveFXMsg('baz', []),
  ];
  const expectedActions = [MarkAgent('baz', 0, 0, 3, 7, 17)];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can doze and wake agents', () => {
  const program = 'baz -> |  a b  c|\ndoze baz\nwake baz';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'baz',
      [60],
      [2 / 4, 3 / 4, 3 / 4],
      ['a', 'b', 'c'],
      'bank',
      0,
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      'inf'
    ),
    th.createCommandMsg('baz', 'doze'),
    th.createCommandMsg('baz', 'wake'),
  ];
  const expectedActions = [MarkAgent('baz', 0, 0, 3, 7, 17)];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('can create a grid', () => {
  const program = '\n\ngrid 8\n';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [];
  const grid =
    '          |       |       |       |       |       |       |       |       |';
  const expectedActions = [ReplaceLine(2, grid)];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('parse a melodic score with chords', () => {
  const program = 'a -> (35)\nfoo -> harp[a1 a 5]^23^+2(4~2)';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createMelodicMsg(
      'foo',
      [[66, 69], 62, [66, 69], 69],
      [1 / 4, 2 / 4, 2 / 4, 1 / 4],
      'harp',
      [0.5],
      [2 / 9, 3 / 9],
      [0],
      0,
      'inf'
    ),
  ];
  const expectedActions = [MarkAgent('foo', 1, 0, 3, 11, 19)];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});

test('parse a percussive score with different sample bank', () => {
  const program = 'foo -> bank1|a b c d |';
  const initialState = atomiix.init();
  const { audio, editor } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      'foo',
      [60],
      [1 / 2, 1 / 2, 1 / 2, 1 / 2],
      ['a', 'b', 'c', 'd'],
      'bank',
      1,
      [0.25],
      [5 / 9],
      [0],
      0,
      'inf'
    ),
  ];
  const expectedActions = [MarkAgent('foo', 0, 0, 3, 12, 22)];
  expect(audio).toEqual(expectedMessages);
  expect(editor).toEqual(expectedActions);
});
