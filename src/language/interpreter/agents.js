// function to create an agent state for the interpreter to keep track of
export function AgentState(
  agentToken,
  scoreToken,
  playing,
  amplitude,
  agentState
) {
  return {
    agent: agentToken,
    score: scoreToken,
    playing,
    amplitude,
    state: agentState,
  };
}

// states that an agent can be in - affects editor/index.js
export const agentStates = {
  PLAYING: 'AGENTSTATEPLAYING',
  STOPPED: 'AGENTSTATESTOPPED',
  SLEEPING: 'AGENTSTATESLEEPING',
};
