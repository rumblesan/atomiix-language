import { AUDIOACTION } from '../types';
import * as t from './types';

export function AgentMethod(agent, method) {
  return {
    type: AUDIOACTION,
    actionType: t.AGENTMETHOD,
    agent,
    method,
  };
}

export function FreeAgent(agent) {
  return {
    type: AUDIOACTION,
    actionType: t.FREEAGENT,
    agent,
  };
}

export function NapAgent(agent, time, timeType, repeats) {
  return {
    type: AUDIOACTION,
    actionType: t.NAPAGENT,
    agent,
    time,
    timeType,
    repeats,
  };
}

export function AddAgentFX(agent, fxList) {
  return {
    type: AUDIOACTION,
    actionType: t.ADDAGENTFX,
    agent,
    fxList,
  };
}

export function RemoveAgentFX(agent, fxList) {
  return {
    type: AUDIOACTION,
    actionType: t.RMAGENTFX,
    agent,
    fxList,
  };
}

export function SetAgentAmplitude(agent, amplitude) {
  return {
    type: AUDIOACTION,
    actionType: t.SETAGENTAMP,
    agent,
    amplitude,
  };
}

export function SetTempo(tempo, glide) {
  return {
    type: AUDIOACTION,
    actionType: t.SETTEMPO,
    tempo,
    glide,
  };
}

// Only an audio action because it uses the audio engine for timing
export function FutureCallback(time, timeType, repeats, callbackID) {
  return {
    type: AUDIOACTION,
    actionType: t.FUTURECALLBACK,
    time,
    timeType,
    repeats,
    callbackID,
  };
}

export function PlayPercussiveScore(agent, score) {
  return {
    type: AUDIOACTION,
    actionType: t.PLAYPERCUSSIVE,
    agent,
    notes: score.notes,
    durations: score.durations,
    instruments: score.instruments,
    sustain: score.sustain,
    attack: score.attack,
    panning: score.panning,
    offset: score.offset,
    repeats: score.repeats,
  };
}

export function PlayMelodicScore(agent, score) {
  return {
    type: AUDIOACTION,
    actionType: t.PLAYMELODIC,
    agent,
    notes: score.notes,
    durations: score.durations,
    instrument: score.instrument,
    sustain: score.sustain,
    attack: score.attack,
    panning: score.panning,
    offset: score.offset,
    repeats: score.repeats,
  };
}

export function PlayConcreteScore(agent, score) {
  return {
    type: AUDIOACTION,
    actionType: t.PLAYCONCRETE,
    agent,
    pitch: score.pitch,
    amplitudes: score.amplitudes,
    durations: score.durations,
    instrument: score.instrument,
    panning: score.panning,
    offset: score.offset,
    repeats: score.repeats,
  };
}
