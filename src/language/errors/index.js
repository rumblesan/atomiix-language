import { AtomiixRuntimeErrorName, AtomiixOSCErrorName } from './types';

export class AtomiixRuntimeError extends Error {
  constructor(message) {
    super(message);
    this.name = AtomiixRuntimeErrorName;
  }
}

export class AtomiixOSCError extends Error {
  constructor(message) {
    super(message);
    this.name = AtomiixOSCErrorName;
  }
}
