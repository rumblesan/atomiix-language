import { OSCMessage } from './transport/osc';

export function createPercussiveMsg(
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

export function createMelodicMsg(
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

export function createConcreteMsg(
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

export function createCommandMsg(addr, command, agentName) {
  const msgArgs = [
    { type: 'string', value: command },
    { type: 'string', value: agentName },
  ];
  return OSCMessage(addr, msgArgs);
}

export function createFXMsg(addr, agentName, effects) {
  const msgArgs = [
    { type: 'string', value: agentName },
    { type: 'array', value: effects },
  ];
  return OSCMessage(addr, msgArgs);
}

export function createEditorAction(name, args) {
  return {
    type: 'EDITORACTION',
    name,
    args,
  };
}
