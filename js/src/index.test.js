import atomiix from './index.js';

import * as th from './test-helpers';
import { MarkAgent, UnmarkAgent } from './transport/editor';

test('basic end to end test', () => {
  const program =
    'baz -> |  a b  c|!8@2\nfoo -> harp[1  3 5]^23^+2(4~2)\nbar -> sea{ 2  6}<37>';
  const initialState = atomiix.init();
  const { messages, actions } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      '/play/pattern',
      'baz',
      [60],
      [2 / 4, 3 / 4, 9 / 4],
      ['a', 'b', 'c'],
      [0.25],
      [5 / 9],
      [0],
      2 / 4,
      2
    ),
    th.createMelodicMsg(
      '/play/pattern',
      'foo',
      [64, 67, 71],
      [3 / 4, 2 / 4, 1 / 4],
      'harp',
      [0.5],
      [2 / 9, 3 / 9],
      [0],
      0,
      'inf'
    ),
    th.createConcreteMsg(
      '/play/pattern',
      'bar',
      [0.2, 0.6],
      [3 / 4, 1 / 4],
      'sea',
      [-0.5, 0.5],
      1 / 4,
      'inf'
    ),
  ];
  const expectedActions = [
    MarkAgent('baz', 0, 0, 2, 7, 17),
    MarkAgent('foo', 1, 0, 2, 11, 19),
    MarkAgent('bar', 2, 0, 2, 10, 17),
  ];
  expect(messages).toEqual(expectedMessages);
  expect(actions).toEqual(expectedActions);
});

test('can free agents', () => {
  const program =
    'baz -> |  a b  c|\nfoo -> harp[1  3 5]^23^+2\nbar -> sea{ 2  6}<37>';
  const initialState = atomiix.init();
  atomiix.evaluate(initialState, program);
  const { messages, actions } = atomiix.free(initialState, program);
  const expectedMessages = [
    th.createCommandMsg('/command', 'free', 'baz'),
    th.createCommandMsg('/command', 'free', 'foo'),
    th.createCommandMsg('/command', 'free', 'bar'),
  ];
  const expectedActions = [
    UnmarkAgent('baz'),
    UnmarkAgent('foo'),
    UnmarkAgent('bar'),
  ];
  expect(messages).toEqual(expectedMessages);
  expect(actions).toEqual(expectedActions);
});

test('can add effects', () => {
  const program = 'baz -> |  a b  c|\nbaz >> reverb >> distortion';
  const initialState = atomiix.init();
  const { messages, actions } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      '/play/pattern',
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
    th.createFXMsg('/agent/effects/add', 'baz', ['reverb', 'distortion']),
  ];
  const expectedActions = [MarkAgent('baz', 0, 0, 2, 7, 17)];
  expect(messages).toEqual(expectedMessages);
  expect(actions).toEqual(expectedActions);
});

test('can remove effects', () => {
  const program = 'baz -> |  a b  c|\nbaz << reverb << distortion';
  const initialState = atomiix.init();
  const { messages, actions } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      '/play/pattern',
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
    th.createFXMsg('/agent/effects/remove', 'baz', ['reverb', 'distortion']),
  ];
  const expectedActions = [MarkAgent('baz', 0, 0, 2, 7, 17)];
  expect(messages).toEqual(expectedMessages);
  expect(actions).toEqual(expectedActions);
});

test('can remove all effects', () => {
  const program = 'baz -> |  a b  c|\nbaz <<';
  const initialState = atomiix.init();
  const { messages, actions } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      '/play/pattern',
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
    th.createFXMsg('/agent/effects/remove', 'baz', []),
  ];
  const expectedActions = [MarkAgent('baz', 0, 0, 2, 7, 17)];
  expect(messages).toEqual(expectedMessages);
  expect(actions).toEqual(expectedActions);
});

test('can doze and wake agents', () => {
  const program = 'baz -> |  a b  c|\ndoze baz\nwake baz';
  const initialState = atomiix.init();
  const { messages, actions } = atomiix.evaluate(initialState, program);
  const expectedMessages = [
    th.createPercussiveMsg(
      '/play/pattern',
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
    th.createCommandMsg('/command', 'doze', 'baz'),
    th.createCommandMsg('/command', 'wake', 'baz'),
  ];
  const expectedActions = [MarkAgent('baz', 0, 0, 2, 7, 17)];
  expect(messages).toEqual(expectedMessages);
  expect(actions).toEqual(expectedActions);
});

test('can move agents', () => {
  const program = 'baz -> |  a b  c|';
  const state = atomiix.init();
  atomiix.evaluate(state, program);
  const { messages, actions } = atomiix.moveAgent(state, 'baz', 3);
  const expectedMessages = [];
  const expectedActions = [];
  expect(messages).toEqual(expectedMessages);
  expect(actions).toEqual(expectedActions);
});
