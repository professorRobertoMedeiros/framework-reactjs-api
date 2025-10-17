"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogType = exports.LogLevel = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var LogType;
(function (LogType) {
    LogType["SQL"] = "sql";
    LogType["HTTP"] = "http";
    LogType["APP"] = "app";
    LogType["ERROR"] = "error";
})(LogType || (exports.LogType = LogType = {}));
class Logger {
    constructor() {
        this.enabled = process.env.LOG_ENABLED === 'true';
        this.logLevel = process.env.LOG_LEVEL || LogLevel.INFO;
        this.sqlLoggingEnabled = process.env.LOG_SQL === 'true';
        this.httpLoggingEnabled = process.env.LOG_HTTP === 'true';
        this.logFilePath = process.env.LOG_FILE_PATH || path.join(process.cwd(), 'logs');
        // Criar diretório de logs se não existir
        if (this.enabled && !fs.existsSync(this.logFilePath)) {
            fs.mkdirSync(this.logFilePath, { recursive: true });
        }
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    shouldLog(level) {
        if (!this.enabled)
            return false;
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const requestedLevelIndex = levels.indexOf(level);
        return requestedLevelIndex >= currentLevelIndex;
    }
    formatLog(entry) {
        return JSON.stringify(entry, null, 2);
    }
    writeToFile(entry) {
        if (!this.enabled)
            return;
        const date = new Date().toISOString().split('T')[0];
        const filename = `${entry.type}-${date}.log`;
        const filepath = path.join(this.logFilePath, filename);
        const logLine = JSON.stringify(entry) + '\n';
        fs.appendFileSync(filepath, logLine, 'utf8');
    }
    writeToConsole(entry) {
        const colors = {
            [LogLevel.DEBUG]: '\x1b[36m', // Cyan
            [LogLevel.INFO]: '\x1b[32m', // Green
            [LogLevel.WARN]: '\x1b[33m', // Yellow
            [LogLevel.ERROR]: '\x1b[31m' // Red
        };
        const color = colors[entry.level] || '\x1b[0m';
        const reset = '\x1b[0m';
        console.log(`${color}[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.type.toUpperCase()}]${reset} ${entry.message}`);
        if (entry.data) {
            console.log('Data:', entry.data);
        }
        if (entry.user) {
            console.log('User:', entry.user);
        }
        if (entry.sql) {
            console.log('SQL:', entry.sql);
        }
        if (entry.error) {
            console.log('Error:', entry.error);
        }
    }
    log(entry) {
        const fullEntry = {
            timestamp: new Date().toISOString(),
            level: entry.level || LogLevel.INFO,
            type: entry.type || LogType.APP,
            message: entry.message || '',
            ...entry
        };
        if (this.shouldLog(fullEntry.level)) {
            this.writeToFile(fullEntry);
            this.writeToConsole(fullEntry);
        }
    }
    // Logs SQL
    logSQL(query, params, duration, user) {
        if (!this.sqlLoggingEnabled)
            return;
        const operation = this.detectSQLOperation(query);
        this.log({
            level: LogLevel.DEBUG,
            type: LogType.SQL,
            message: `SQL ${operation} executed`,
            user: user || undefined,
            sql: {
                query: query.trim(),
                params,
                duration,
                operation
            }
        });
    }
    detectSQLOperation(query) {
        const normalizedQuery = query.trim().toUpperCase();
        if (normalizedQuery.startsWith('SELECT'))
            return 'SELECT';
        if (normalizedQuery.startsWith('INSERT'))
            return 'INSERT';
        if (normalizedQuery.startsWith('UPDATE'))
            return 'UPDATE';
        if (normalizedQuery.startsWith('DELETE'))
            return 'DELETE';
        return 'OTHER';
    }
    // Logs HTTP
    logHTTP(method, url, statusCode, duration, ip, userAgent, user) {
        if (!this.httpLoggingEnabled)
            return;
        const level = statusCode >= 500 ? LogLevel.ERROR :
            statusCode >= 400 ? LogLevel.WARN :
                LogLevel.INFO;
        this.log({
            level,
            type: LogType.HTTP,
            message: `${method} ${url} ${statusCode} - ${duration}ms`,
            user: user || undefined,
            request: {
                method,
                url,
                ip,
                userAgent
            },
            data: {
                statusCode,
                duration
            }
        });
    }
    // Logs genéricos
    debug(message, data, user) {
        this.log({
            level: LogLevel.DEBUG,
            type: LogType.APP,
            message,
            data,
            user: user || undefined
        });
    }
    info(message, data, user) {
        this.log({
            level: LogLevel.INFO,
            type: LogType.APP,
            message,
            data,
            user: user || undefined
        });
    }
    warn(message, data, user) {
        this.log({
            level: LogLevel.WARN,
            type: LogType.APP,
            message,
            data,
            user: user || undefined
        });
    }
    error(message, error, user) {
        this.log({
            level: LogLevel.ERROR,
            type: LogType.ERROR,
            message,
            user: user || undefined,
            error: error ? {
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
}
exports.Logger = Logger;
// Singleton instance
exports.logger = Logger.getInstance();
//# sourceMappingURL=Logger.js.map