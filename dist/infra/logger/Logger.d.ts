/**
 * Sistema de Logs do Framework
 *
 * Configurações via .env:
 * - LOG_ENABLED=true|false
 * - LOG_LEVEL=debug|info|warn|error
 * - LOG_SQL=true|false
 * - LOG_HTTP=true|false
 * - LOG_FILE_PATH=./logs
 */
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
export declare enum LogType {
    SQL = "sql",
    HTTP = "http",
    APP = "app",
    ERROR = "error"
}
export interface LogEntry {
    timestamp: string;
    requestId: string;
    level: LogLevel;
    type: LogType;
    message: string;
    data?: any;
    user?: {
        id: number;
        email: string;
    } | null;
    request?: {
        method: string;
        url: string;
        ip: string;
        userAgent?: string;
    };
    sql?: {
        query: string;
        params?: any[];
        duration?: number;
        operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER';
    };
    error?: {
        message: string;
        stack?: string;
    };
}
export declare class Logger {
    private static instance;
    private enabled;
    private logLevel;
    private sqlLoggingEnabled;
    private httpLoggingEnabled;
    private logFilePath;
    private constructor();
    static getInstance(): Logger;
    private shouldLog;
    private formatLog;
    private writeToFile;
    private writeToConsole;
    private log;
    logSQL(query: string, params?: any[], duration?: number, user?: {
        id: number;
        email: string;
    } | null): void;
    private detectSQLOperation;
    logHTTP(method: string, url: string, statusCode: number, duration: number, ip: string, userAgent?: string, user?: {
        id: number;
        email: string;
    } | null): void;
    debug(message: string, data?: any, user?: {
        id: number;
        email: string;
    } | null): void;
    info(message: string, data?: any, user?: {
        id: number;
        email: string;
    } | null): void;
    warn(message: string, data?: any, user?: {
        id: number;
        email: string;
    } | null): void;
    error(message: string, error?: Error, user?: {
        id: number;
        email: string;
    } | null): void;
}
export declare const logger: Logger;
