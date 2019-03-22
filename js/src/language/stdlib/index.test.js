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
