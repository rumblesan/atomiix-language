import { AtomiixRuntimeErrorName, AtomiixOSCErrorName } from './types';

export class AtomiixRuntimeError extends Error {
  constructor(message, lineNumber) {
    super(message);
    this.name = AtomiixRuntimeErrorName;
    this.lineNumber = lineNumber;
    this.setLineNumber = this.setLineNumber.bind(this);
  }

  setLineNumber(lineNumber) {
    this.lineNumber = lineNumber;
  }
}

export class AtomiixOSCError extends Error {
  constructor(message) {
    super(message);
    this.name = AtomiixOSCErrorName;
  }
}
