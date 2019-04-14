export class AtomiixRuntimeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AtomiixRuntimeError';
  }
}

export class AtomiixOSCError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AtomiixOSCError';
  }
}
