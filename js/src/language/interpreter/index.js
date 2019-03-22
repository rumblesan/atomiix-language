import scales from '../../music/scales';
import * as ast from '../ast';
import * as astTypes from '../ast/types';
import * as audioActions from '../../actions/audio';

import { addActiveAgent, deactivateAgent, getAgentInfo } from './state';

import { AtomiixRuntimeError } from '../errors';

export function intervalToNote(state, interval) {
  return state.tonic + scales.notes[state.scale][interval];
}

export function getStatementAgent(state, statementAST) {
  switch (statementAST.type) {
    case astTypes.PLAY:
      return statementAST.agent;
    default:
      return null;
  }
}

export function getAgentNames(state, programAST) {
  let agentNames = [];
  for (let i = 0; i < programAST.statements.length; i += 1) {
    const s = programAST.statements[i];
    const agent = getStatementAgent(state, s);
    if (agent) {
      agentNames.push(agent.name);
    }
  }
  return {
    agentNames,
  };
}

export function freeAgents(state, programAST) {
  const { agentNames } = getAgentNames(state, programAST);
  let actions = [];
  agentNames.forEach(n => {
    actions.push(audioActions.FreeAgent(n));
    actions = actions.concat(deactivateAgent(state, n));
  });
  return actions;
}

export function reevaluateAgent(state, agentName) {
  const existing = state.agents[agentName];
  if (!existing) {
    throw new AtomiixRuntimeError(`No agent called ${agentName}`);
  }
  return interpretScore(state, existing.agent, existing.score);
}

export function runCallback(state, callbackID) {
  const cb = state.callbacks[callbackID];
  return interpret(state, cb.command);
}

// Turns a program AST into a new state object and
// a series of OSC messages and editor actions
export function interpret(state, programAST, lineOffset = 0) {
  let actions = [];
  for (let i = 0; i < programAST.statements.length; i += 1) {
    const s = programAST.statements[i];
    const outputMsgs = interpretStatement(state, s, lineOffset);
    if (outputMsgs) {
      actions = actions.concat(outputMsgs);
    }
  }
  return actions;
}

export function interpretStatement(state, statementAST, lineOffset) {
  switch (statementAST.type) {
    case astTypes.PLAY:
      return interpretPlay(state, statementAST, lineOffset);
    case astTypes.ADDFXCHAIN:
      return interpretAddFX(state, statementAST);
    case astTypes.RMFXCHAIN:
      return interpretRemoveFX(state, statementAST);
    case astTypes.INCRAMP:
      return interpretAmplitudeChange(state, statementAST, 0.1);
    case astTypes.DECRAMP:
      return interpretAmplitudeChange(state, statementAST, -0.1);
    case astTypes.COMMAND:
      return interpretCommand(state, statementAST, lineOffset);
    case astTypes.FUTURE:
      return interpretFuture(state, statementAST, lineOffset);
    case astTypes.GROUP:
      return interpretGroup(state, statementAST, lineOffset);
    default:
      throw new AtomiixRuntimeError(
        `${statementAST.type} is not a supported statement type`
      );
  }
}

export function interpretAddFX(state, { agent, effects }) {
  return [audioActions.AddAgentFX(agent.name, effects.map(e => e.name))];
}

export function interpretRemoveFX(state, { agent, effects }) {
  return [audioActions.RemoveAgentFX(agent.name, effects.map(e => e.name))];
}

export function interpretAmplitudeChange(state, { agent }, change) {
  const agentInfo = state.agents[agent.name];
  if (!agentInfo) {
    // TODO warning?
    return;
  }
  agentInfo.amplitude = agentInfo.amplitude + change;
  return [audioActions.SetAgentAmplitude(agent.name, agentInfo.amplitude)];
}

export function interpretCommand(state, command, lineOffset) {
  const commandName = command.name;
  const cmd = state.stdlib[commandName];
  if (!cmd) {
    throw new AtomiixRuntimeError(`${commandName} is not an existing command`);
  }
  const msgs = cmd(state, command, lineOffset);
  return msgs;
}

export function interpretFuture(state, future, lineOffset) {
  const callbackID =
    Math.random()
      .toString(36)
      .substring(7) + state.lastCallbackID;
  state.lastCallbackID += 1;
  state.callbacks[callbackID] = {
    command: ast.Program([future.command]),
    line: future.line + lineOffset,
  };
  let timeType = 'seconds';
  if (future.timing.type === astTypes.BEAT) {
    timeType = 'beats';
  }
  let repeats = 1;
  if (future.timing.modifier) {
    repeats = future.timing.modifier;
  }
  return [
    audioActions.FutureCallback(
      future.timing.value,
      timeType,
      repeats,
      callbackID
    ),
  ];
}

export function interpretGroup(state, { name, agents }) {
  if (state.agents[name]) {
    throw new AtomiixRuntimeError(`${name} is already the name of an agent`);
  }

  if (state.groups[name]) {
    throw new AtomiixRuntimeError(`${name} is already the name of a group`);
  }

  const agentNames = agents.map(a => {
    // call getAgentInfo to make sure agent exists
    // but just return the name
    getAgentInfo(state, a);
    return a;
  });

  state.groups[name] = agentNames;
  return [];
}

export function interpretPlay(state, { agent, score }, lineOffset) {
  let msgs = interpretScore(state, agent, score);
  msgs = msgs.concat(addActiveAgent(state, agent, score, lineOffset));
  return msgs;
}

export function interpretScore(state, agent, score) {
  const scoreType = score.scoreType;
  switch (scoreType) {
    case astTypes.PERCUSSIVE:
      return interpretPercussiveScore(state, agent, score);
    case astTypes.MELODIC:
      return interpretMelodicScore(state, agent, score);
    case astTypes.CONCRETE:
      return interpretConcreteScore(state, agent, score);
    default:
      throw new AtomiixRuntimeError(
        `${scoreType} is not a supported score type`
      );
  }
}

export function interpretPercussiveScore(state, agent, score) {
  // TODO does note pull anything from the default state tonic?
  const scoreNotes = [60];
  const {
    notes,
    durations,
    sustain,
    attack,
    panning,
    repeats,
  } = interpretModifiers(state, scoreNotes, score.durations, score.modifiers);
  const instruments = score.values;
  const quantphase = score.offset / 4;

  const ps = ast.PercussiveScore(
    notes,
    durations,
    instruments,
    sustain,
    attack,
    panning,
    quantphase,
    repeats
  );
  const msg = audioActions.PlayPercussiveScore(agent.name, ps);
  return [msg];
}

export function interpretMelodicScore(state, agent, score) {
  const scoreNotes = score.values.map(i => intervalToNote(state, i));
  const {
    notes,
    durations,
    sustain,
    attack,
    panning,
    repeats,
  } = interpretModifiers(state, scoreNotes, score.durations, score.modifiers);
  const instrument = score.instrument;
  const quantphase = score.offset / 4;

  const ms = ast.MelodicScore(
    notes,
    durations,
    instrument,
    sustain,
    attack,
    panning,
    quantphase,
    repeats
  );
  const msg = audioActions.PlayMelodicScore(agent.name, ms);
  return [msg];
}

export function interpretConcreteScore(state, agent, score) {
  // TODO should this be a float?
  const pitch = 60;
  const { durations, panning, repeats } = interpretModifiers(
    state,
    [],
    score.durations,
    score.modifiers
  );
  const amplitudes = score.values.map(v => v / 10);
  const instrument = score.instrument;
  const quantphase = score.offset / 4;

  const cs = ast.ConcreteScore(
    pitch,
    amplitudes,
    durations,
    instrument,
    panning,
    quantphase,
    repeats
  );
  const msg = audioActions.PlayConcreteScore(agent.name, cs);
  return [msg];
}

export function interpretModifiers(
  state,
  scoreNotes,
  scoreDurations,
  modifiers
) {
  let notes = scoreNotes;
  let durations = scoreDurations;
  let sustain = [1 / 4];
  let attack = [5];
  let panning = [0];
  let timestretch = 1;
  let silences = 0;
  let repeats = 'inf';
  for (let i = 0; i < modifiers.length; i += 1) {
    const m = modifiers[i];
    if (m.type === astTypes.SCOREMODIFIER) {
      switch (m.modifierType) {
        case astTypes.PANNING:
          panning = m.values.map(n => (n - 1) / 4 - 1);
          break;
        case astTypes.SUSTAIN:
          sustain = [(1 / m.noteLength) * (m.multiplier || 1)];
          break;
        case astTypes.ATTACK:
          attack = m.values;
          break;
      }
    } else if (m.type === astTypes.SCOREOPERATOR) {
      // TODO handle * and / operators
      switch (m.operator) {
        case '+':
          notes = notes.map(n => n + m.value);
          break;
        case '-':
          notes = notes.map(n => n - m.value);
          break;
        case '*':
          timestretch = m.value;
          break;
        case '/':
          timestretch = 1 / m.value;
          break;
        case '!':
          silences = m.value;
          break;
        case '@':
          repeats = m.value;
          break;
      }
    }
  }
  // add silence onto last duration
  durations[durations.length - 1] += silences;
  // make everything quarter notes
  // then multiply my timestretch
  durations = durations.map(n => n / 4).map(n => n * timestretch);
  attack = attack.map(n => n / 9);
  return {
    notes,
    durations,
    sustain,
    attack,
    panning,
    silences,
    timestretch,
    repeats,
  };
}
