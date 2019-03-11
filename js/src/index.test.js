import atomiix from './index.js';

import * as th from './test-helpers';

const parser = atomiix.parser;
const interpreter = atomiix.interpreter;

test('basic end to end test', () => {
  const program =
    'baz -> |  a b  c|!8@2\nfoo -> harp[1  3 5]^23^+2(4~2)\nbar -> sea{ 2  6}<37>';
  const ast = parser.parse(program);
  const initialState = interpreter.createState();
  const { messages } = interpreter.interpret(initialState, ast);
  const expected = [
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
    th.createEditorAction('HIGHLIGHTLINE', [1]),
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
    th.createEditorAction('HIGHLIGHTLINE', [2]),
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
    th.createEditorAction('HIGHLIGHTLINE', [3]),
  ];
  expect(messages).toEqual(expected);
});

test('can free agents', () => {
  const program =
    'baz -> |  a b  c|\nfoo -> harp[1  3 5]^23^+2\nbar -> sea{ 2  6}<37>';
  const ast = parser.parse(program);
  const state = interpreter.createState();
  interpreter.interpret(state, ast);
  const { messages } = interpreter.freeAgents(state, ast);
  const expected = [
    th.createCommandMsg('/command', 'free', 'baz'),
    th.createEditorAction('LOWLIGHTLINE', [1]),
    th.createCommandMsg('/command', 'free', 'foo'),
    th.createEditorAction('LOWLIGHTLINE', [2]),
    th.createCommandMsg('/command', 'free', 'bar'),
    th.createEditorAction('LOWLIGHTLINE', [3]),
  ];
  expect(messages).toEqual(expected);
});

test('can add effects', () => {
  const program = 'baz -> |  a b  c|\nbaz >> reverb >> distortion';
  const ast = parser.parse(program);
  const initialState = interpreter.createState();
  const { messages } = interpreter.interpret(initialState, ast);
  const expected = [
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
    th.createEditorAction('HIGHLIGHTLINE', [1]),
    th.createFXMsg('/agent/effects/add', 'baz', ['reverb', 'distortion']),
  ];
  expect(messages).toEqual(expected);
});

test('can remove effects', () => {
  const program = 'baz -> |  a b  c|\nbaz << reverb << distortion';
  const ast = parser.parse(program);
  const initialState = interpreter.createState();
  const { messages } = interpreter.interpret(initialState, ast);
  const expected = [
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
    th.createEditorAction('HIGHLIGHTLINE', [1]),
    th.createFXMsg('/agent/effects/remove', 'baz', ['reverb', 'distortion']),
  ];
  expect(messages).toEqual(expected);
});

test('can remove all effects', () => {
  const program = 'baz -> |  a b  c|\nbaz <<';
  const ast = parser.parse(program);
  const initialState = interpreter.createState();
  const { messages } = interpreter.interpret(initialState, ast);
  const expected = [
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
    th.createEditorAction('HIGHLIGHTLINE', [1]),
    th.createFXMsg('/agent/effects/remove', 'baz', []),
  ];
  expect(messages).toEqual(expected);
});

test('can doze and wake agents', () => {
  const program = 'baz -> |  a b  c|\ndoze baz\nwake baz';
  const ast = parser.parse(program);
  const initialState = interpreter.createState();
  const { messages } = interpreter.interpret(initialState, ast);
  const expected = [
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
    th.createEditorAction('HIGHLIGHTLINE', [1]),
    th.createCommandMsg('/command', 'doze', 'baz'),
    th.createEditorAction('LOWLIGHTLINE', [1]),
    th.createCommandMsg('/command', 'wake', 'baz'),
    th.createEditorAction('HIGHLIGHTLINE', [1]),
  ];
  expect(messages).toEqual(expected);
});
