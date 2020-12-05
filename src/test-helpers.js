export function createPercussiveMsg(
  agentName,
  notes,
  durations,
  instruments,
  sampleBank,
  sustain,
  attack,
  panning,
  offset,
  repeats
) {
  return {
    type: 'AUDIOACTION',
    actionType: 'PLAYPERCUSSIVE',
    agent: agentName,
    notes,
    durations,
    instruments,
    sampleBank,
    sustain,
    attack,
    panning,
    offset,
    repeats,
  };
}

export function createMelodicMsg(
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
  return {
    type: 'AUDIOACTION',
    actionType: 'PLAYMELODIC',
    agent: agentName,
    notes,
    durations,
    instrument,
    sustain,
    attack,
    panning,
    offset,
    repeats,
  };
}

export function createConcreteMsg(
  agentName,
  amplitudes,
  durations,
  instrument,
  panning,
  offset,
  repeats
) {
  return {
    type: 'AUDIOACTION',
    actionType: 'PLAYCONCRETE',
    agent: agentName,
    pitch: 60,
    amplitudes,
    durations,
    instrument,
    panning,
    offset,
    repeats,
  };
}

export function createCommandMsg(agentName, method) {
  return {
    type: 'AUDIOACTION',
    actionType: 'AGENTMETHOD',
    agent: agentName,
    method,
  };
}

export function createFreeAgentMsg(agentName) {
  return {
    type: 'AUDIOACTION',
    actionType: 'FREEAGENT',
    agent: agentName,
  };
}

export function createAddFXMsg(agentName, fxList) {
  return {
    type: 'AUDIOACTION',
    actionType: 'ADDAGENTFX',
    agent: agentName,
    fxList,
  };
}

export function createRemoveFXMsg(agentName, fxList) {
  return {
    type: 'AUDIOACTION',
    actionType: 'RMAGENTFX',
    agent: agentName,
    fxList,
  };
}

export function createMarkAction(
  agentName,
  line,
  agentStart,
  agentEnd,
  scoreStart,
  scoreEnd
) {
  return {
    type: 'EDITORACTION',
    actionType: 'MARKTEXT',
    group: agentName,
    sections: {
      agent: {
        line,
        start: agentStart,
        finish: agentEnd,
      },
      score: {
        line,
        start: scoreStart,
        finish: scoreEnd,
      },
    },
  };
}
export function createUnmarkAction(agentName) {
  return {
    type: 'EDITORACTION',
    actionType: 'UNMARKTEXT',
    group: agentName,
  };
}
