import { AtomiixRuntimeErrorName, AtomiixOSCErrorName } from './types';

export class AtomiixRuntimeError extends Error {
  constructor(message, lineNumber, inCallback) {
    super(message);
    this.name = AtomiixRuntimeErrorName;
    this.lineNumber = lineNumber;
    this.inCallback = inCallback;
    this.setLineNumber = this.setLineNumber.bind(this);
    this.setCallbackStatus = this.setCallbackStatus.bind(this);
    this.formattedMessage = this.formattedMessage.bind(this);
  }

  setLineNumber(lineNumber) {
    this.lineNumber = lineNumber;
  }

  setCallbackStatus(st) {
    this.inCallback = st;
  }

  formattedMessage() {
    let pos = '';
    if (this.lineNumber !== undefined) {
      pos = ` on line ${this.lineNumber}`;
    }
    let cb = '';
    if (this.inCallback) {
      cb = ' in callback';
    }
    return `Error${cb}${pos}: ${this.message}`;
  }
}

export class AtomiixOSCError extends Error {
  constructor(message) {
    super(message);
    this.name = AtomiixOSCErrorName;
    this.formattedMessage = this.formattedMessage.bind(this);
  }

  formattedMessage() {
    return `OSCError: ${this.message}`;
  }
}
