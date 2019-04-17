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

export const agentStates = {
  PLAYING: 'AGENTSTATEPLAYING',
  STOPPED: 'AGENTSTATESTOPPED',
  SLEEPING: 'AGENTSTATESLEEPING',
};
