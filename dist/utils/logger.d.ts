export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export declare class Logger {
    private static instance;
    private logLevel;
    private constructor();
    static getInstance(): Logger;
    setLogLevel(level: LogLevel): void;
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    success(message: string): void;
    file(filePath: string): void;
}
//# sourceMappingURL=logger.d.ts.map