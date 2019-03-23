import * as th from '../test-helpers';
import * as inbound from '../actions/inbound';
import {
  audioActionToOSC,
  oscAddresses,
  oscToInboundAction,
  oscDestinations,
} from './osc';

function AddFXMessage(name, fxList) {
  return {
    oscType: 'message',
    address: '/agent/effects/add',
    args: [{ type: 'string', value: name }, { type: 'array', value: fxList }],
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
