export class AtomiixRuntimeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AtomiixRuntimeError';
  }
}
