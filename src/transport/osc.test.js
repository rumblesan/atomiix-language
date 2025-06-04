import { expect, test } from 'vitest';

import * as th from '../test-helpers';
import * as inbound from '../actions/inbound';
import {
  audioActionToOSC,
  oscAddresses,
  oscToInboundAction,
  oscDestinations,
} from './osc';

function PlayMelodicOSC(
  agentName,
  notes,
  durations,
  instrument,
  sustain,
  attack,
  panning,
  offset,
  midiChannel
) {
  return {
    oscType: 'message',
    address: '/play/pattern',
    args: [
      { type: 'string', value: 'melodic' },
      { type: 'string', value: agentName },
      {
        type: 'array',
        value: notes.map((n) => ({ type: 'integer', value: n })),
      },
      { type: 'array', value: durations },
      { type: 'string', value: instrument },
      { type: 'array', value: sustain },
      { type: 'array', value: attack },
      { type: 'array', value: panning },
      { type: 'float', value: offset },
      { type: 'bang' },
      { type: 'integer', value: midiChannel },
    ],
  };
}

function AddFXMessage(name, fxList) {
  return {
    oscType: 'message',
    address: '/agent/effects/add',
    args: [
      { type: 'string', value: name },
      { type: 'array', value: fxList },
    ],
  };
}

function AgentFinishedOSC(name) {
  return {
    oscType: 'message',
    address: '/finished',
    args: [{ type: 'string', value: name }],
  };
}

function CallbackOSC(callbackId, remaining) {
  return {
    oscType: 'message',
    address: '/callback',
    args: [
      { type: 'string', value: callbackId },
      { type: 'integer', value: remaining },
    ],
  };
}

test('can convert a playMelodicScore action into an OSC message', () => {
  const action = th.createMelodicMsg(
    'foo',
    [62, 66, 69],
    [3 / 4, 2 / 4, 1 / 4],
    'harp',
    [0.5],
    [2 / 9, 3 / 9],
    [0],
    0,
    'inf',
    0
  );
  const expected = PlayMelodicOSC(
    'foo',
    [62, 66, 69],
    [3 / 4, 2 / 4, 1 / 4],
    'harp',
    [0.5],
    [2 / 9, 3 / 9],
    [0],
    0,
    0
  );
  const oscMessage = audioActionToOSC(oscAddresses, action);
  expect(oscMessage).toEqual(expected);
});

test('can convert an addFX action into an OSC message', () => {
  const action = th.createAddFXMsg('baz', ['reverb', 'distortion']);
  const expected = AddFXMessage('baz', ['reverb', 'distortion']);
  const oscMessage = audioActionToOSC(oscAddresses, action);
  expect(oscMessage).toEqual(expected);
});

test('can convert an inbound agent finished osc message into an action', () => {
  const oscMessage = AgentFinishedOSC('baz');
  const action = oscToInboundAction(oscDestinations, oscMessage);
  const expected = inbound.AgentFinished('baz');
  expect(action).toEqual(expected);
});

test('can convert an inbound callback osc message into an action', () => {
  const oscMessage = CallbackOSC('baz1', 2);
  const action = oscToInboundAction(oscDestinations, oscMessage);
  const expected = inbound.CallbackTriggered('baz1', 2);
  expect(action).toEqual(expected);
});
