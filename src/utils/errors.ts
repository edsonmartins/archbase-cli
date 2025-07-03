export class GeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeneratorError';
  }
}

export class AnalyzerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalyzerError';
  }
}

export class CommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandError';
  }
}