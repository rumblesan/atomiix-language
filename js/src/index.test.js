import atomiix from './index.js';
import { OSCMessage } from './transport/osc';

const parser = atomiix.parser;
const interpreter = atomiix.interpreter;

function createPercussiveMsg(
  addr,
  agentName,
  notes,
  durations,
  instruments,
  sustain,
  attack,
  panning,
  offset,
  repeats
) {
  const msgArgs = [
    { type: 'string', value: 'percussive' },
    { type: 'string', value: agentName },
    { type: 'array', value: notes },
    { type: 'array', value: durations },
    { type: 'array', value: instruments },
    { type: 'array', value: sustain },
    { type: 'array', value: attack },
    { type: 'array', value: panning },
    { type: 'integer', value: offset },
    repeats === 'inf' ? { type: 'bang' } : { type: 'integer', value: repeats },
  ];
  return OSCMessage(addr, msgArgs);
}

function createMelodicMsg(
  addr,
  agentName,
  notes,
  durations,
  instrument,
  sustain,
  attack,
  panning,
  offset,
  repeats
) {
  const msgArgs = [
    { type: 'string', value: 'melodic' },
    { type: 'string', value: agentName },
    { type: 'array', value: notes },
    { type: 'array', value: durations },
    { type: 'string', value: instrument },
    { type: 'array', value: sustain },
    { type: 'array', value: attack },
    { type: 'array', value: panning },
    { type: 'integer', value: offset },
    repeats === 'inf' ? { type: 'bang' } : { type: 'integer', value: repeats },
  ];
  return OSCMessage(addr, msgArgs);
}

function createConcreteMsg(
  addr,
  agentName,
  amplitudes,
  durations,
  instrument,
  panning,
  offset,
  repeats
) {
  const msgArgs = [
    { type: 'string', value: 'concrete' },
    { type: 'string', value: agentName },
    { type: 'integer', value: 60 },
    { type: 'array', value: amplitudes },
    { type: 'array', value: durations },
    { type: 'string', value: instrument },
    { type: 'array', value: panning },
    { type: 'integer', value: offset },
    repeats === 'inf' ? { type: 'bang' } : { type: 'integer', value: repeats },
  ];
  return OSCMessage(addr, msgArgs);
}

test('basic end to end test', () => {
  const program =
    'baz -> |  a b  c|\nfoo -> harp[1  3 5]^23^+2\nbar -> sea{ 2  6}<37>';
  const ast = parser.parse(program);
  const initialState = interpreter.createState();
  const { messages } = interpreter.interpret(initialState, ast);
  const expected = [
    createPercussiveMsg(
      '/play/pattern',
      'baz',
      [60],
      [2, 3, 1],
      ['a', 'b', 'c'],
      [0.25],
      [5 / 9],
      [0],
      2,
      'inf'
    ),
    createMelodicMsg(
      '/play/pattern',
      'foo',
      [64, 67, 71],
      [3, 2, 1],
      'harp',
      [0.25],
      [2 / 9, 3 / 9],
      [0],
      0,
      'inf'
    ),
    createConcreteMsg(
      '/play/pattern',
      'bar',
      [2, 6],
      [3, 1],
      'sea',
      [-0.5, 0.5],
      1,
      'inf'
    ),
  ];
  expect(messages).toEqual(expected);
});
