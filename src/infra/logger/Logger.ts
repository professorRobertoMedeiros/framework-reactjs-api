import * as fs from 'fs';
import * as path from 'path';

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

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export enum LogType {
  SQL = 'sql',
  HTTP = 'http',
  APP = 'app',
  ERROR = 'error'
}

export interface LogEntry {
  timestamp: string;
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

export class Logger {
  private static instance: Logger;
  private enabled: boolean;
  private logLevel: LogLevel;
  private sqlLoggingEnabled: boolean;
  private httpLoggingEnabled: boolean;
  private logFilePath: string;

  private constructor() {
    this.enabled = process.env.LOG_ENABLED === 'true';
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
    this.sqlLoggingEnabled = process.env.LOG_SQL === 'true';
    this.httpLoggingEnabled = process.env.LOG_HTTP === 'true';
    this.logFilePath = process.env.LOG_FILE_PATH || path.join(process.cwd(), 'logs');

    // Criar diretório de logs se não existir
    if (this.enabled && !fs.existsSync(this.logFilePath)) {
      fs.mkdirSync(this.logFilePath, { recursive: true });
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;

    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);

    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry, null, 2);
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.enabled) return;

    const date = new Date().toISOString().split('T')[0];
    const filename = `${entry.type}-${date}.log`;
    const filepath = path.join(this.logFilePath, filename);

    const logLine = JSON.stringify(entry) + '\n';

    fs.appendFileSync(filepath, logLine, 'utf8');
  }

  private writeToConsole(entry: LogEntry): void {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m'  // Red
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

  private log(entry: Partial<LogEntry>): void {
    const fullEntry: LogEntry = {
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
  public logSQL(
    query: string,
    params?: any[],
    duration?: number,
    user?: { id: number; email: string } | null
  ): void {
    if (!this.sqlLoggingEnabled) return;

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

  private detectSQLOperation(query: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER' {
    const normalizedQuery = query.trim().toUpperCase();
    
    if (normalizedQuery.startsWith('SELECT')) return 'SELECT';
    if (normalizedQuery.startsWith('INSERT')) return 'INSERT';
    if (normalizedQuery.startsWith('UPDATE')) return 'UPDATE';
    if (normalizedQuery.startsWith('DELETE')) return 'DELETE';
    
    return 'OTHER';
  }

  // Logs HTTP
  public logHTTP(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    ip: string,
    userAgent?: string,
    user?: { id: number; email: string } | null
  ): void {
    if (!this.httpLoggingEnabled) return;

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
  public debug(message: string, data?: any, user?: { id: number; email: string } | null): void {
    this.log({
      level: LogLevel.DEBUG,
      type: LogType.APP,
      message,
      data,
      user: user || undefined
    });
  }

  public info(message: string, data?: any, user?: { id: number; email: string } | null): void {
    this.log({
      level: LogLevel.INFO,
      type: LogType.APP,
      message,
      data,
      user: user || undefined
    });
  }

  public warn(message: string, data?: any, user?: { id: number; email: string } | null): void {
    this.log({
      level: LogLevel.WARN,
      type: LogType.APP,
      message,
      data,
      user: user || undefined
    });
  }

  public error(message: string, error?: Error, user?: { id: number; email: string } | null): void {
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

// Singleton instance
export const logger = Logger.getInstance();
