import * as astTypes from '../ast/types';
import { AtomiixRuntimeError } from '../errors';

export function expectArgs(name, args, num) {
  if (args.length !== num) {
    throw new AtomiixRuntimeError(`${name} expected ${num} arguments`);
  }
}

export function expectString(name, arg) {
  if (arg.type !== astTypes.STRING) {
    throw new AtomiixRuntimeError(
      `${name} expected String but got ${arg.type}`
    );
  }
  return arg.value;
}

export function expectNum(name, arg) {
  if (arg.type !== astTypes.NUMBER) {
    throw new AtomiixRuntimeError(
      `${name} expected Number but got ${arg.type}`
    );
  }
  return arg.value;
}
