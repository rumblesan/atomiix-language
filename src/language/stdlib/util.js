// defines expected arguments for functions like shake or yoyo - avoids duplication within individual functions
import * as astTypes from '../ast/types';
import { AtomiixRuntimeError } from '../errors';

export function expectArgs(state, name, args, num) {
  if (args.length < num) {
    throw new AtomiixRuntimeError(
      state.translation.errors.expectedArgs(name, num)
    );
  }
}

export function expectString(state, name, arg) {
  if (arg.type !== astTypes.STRING) {
    throw new AtomiixRuntimeError(
      state.translation.errors.expectedString(name, arg.type)
    );
  }
  return arg.value;
}

export function expectNum(state, name, arg) {
  if (arg.type !== astTypes.NUMBER) {
    throw new AtomiixRuntimeError(
      state.translation.errors.expectedNum(name, arg.type)
    );
  }
  return arg.value;
}

export function optionalNum(state, name, arg, defaultVal) {
  if (arg === undefined) {
    return defaultVal;
  }
  return expectNum(state, name, arg);
}

export function optionalString(state, name, arg, defaultVal) {
  if (arg === undefined) {
    return defaultVal;
  }
  return expectString(state, name, arg);
}

export function handleGroup(state, name, func) {
  let msgs = [];
  if (state.groups[name]) {
    state.groups[name].forEach(agentName => {
      msgs = msgs.concat(func(state, agentName));
    });
    return msgs;
  }
  return func(state, name);
}
