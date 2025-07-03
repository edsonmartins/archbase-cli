"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandError = exports.AnalyzerError = exports.GeneratorError = void 0;
class GeneratorError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GeneratorError';
    }
}
exports.GeneratorError = GeneratorError;
class AnalyzerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AnalyzerError';
    }
}
exports.AnalyzerError = AnalyzerError;
class CommandError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CommandError';
    }
}
exports.CommandError = CommandError;
//# sourceMappingURL=errors.js.map