import atomiix from '../../index.js';

import * as th from '../../test-helpers';
import { ReplaceScore, MarkAgent } from '../../actions/editor';

test('can reverse an agents score', () => {
  const program = 'baz -> |  a b  c|\nreverse baz';
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
    th.createPercussiveMsg(
      '/play/pattern',
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
  expect(messages).toEqual(expectedMessages);
  expect(actions).toEqual(expectedActions);
});
