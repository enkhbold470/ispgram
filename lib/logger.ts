export interface LogEntry {
  id: string
  timestamp: Date
  level: 'log' | 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: string
  data?: unknown
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000 // Keep last 1000 logs
  private originalConsole: {
    log: typeof console.log
    info: typeof console.info
    warn: typeof console.warn
    error: typeof console.error
    debug: typeof console.debug
  }

  constructor() {
    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    }

    // Override console methods
    this.setupConsoleInterception()
  }

  private setupConsoleInterception() {
    console.log = (...args: unknown[]) => {
      this.addLog('log', this.formatMessage(args), undefined, args.length > 1 ? args.slice(1) : undefined)
      this.originalConsole.log(...args)
    }

    console.info = (...args: unknown[]) => {
      this.addLog('info', this.formatMessage(args), undefined, args.length > 1 ? args.slice(1) : undefined)
      this.originalConsole.info(...args)
    }

    console.warn = (...args: unknown[]) => {
      this.addLog('warn', this.formatMessage(args), undefined, args.length > 1 ? args.slice(1) : undefined)
      this.originalConsole.warn(...args)
    }

    console.error = (...args: unknown[]) => {
      this.addLog('error', this.formatMessage(args), undefined, args.length > 1 ? args.slice(1) : undefined)
      this.originalConsole.error(...args)
    }

    console.debug = (...args: unknown[]) => {
      this.addLog('debug', this.formatMessage(args), undefined, args.length > 1 ? args.slice(1) : undefined)
      this.originalConsole.debug(...args)
    }
  }

  private formatMessage(args: unknown[]): string {
    return args
      .map((arg) => {
        if (typeof arg === 'string') return arg
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      })
      .join(' ')
  }

  private addLog(level: LogEntry['level'], message: string, context?: string, data?: unknown) {
    const logEntry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      context,
      data,
    }

    this.logs.push(logEntry)

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  // Public API for manual logging
  log(message: string, context?: string, data?: unknown) {
    this.addLog('log', message, context, data)
    this.originalConsole.log(`[${context || 'LOG'}]`, message, data || '')
  }

  info(message: string, context?: string, data?: unknown) {
    this.addLog('info', message, context, data)
    this.originalConsole.info(`[${context || 'INFO'}]`, message, data || '')
  }

  warn(message: string, context?: string, data?: unknown) {
    this.addLog('warn', message, context, data)
    this.originalConsole.warn(`[${context || 'WARN'}]`, message, data || '')
  }

  error(message: string, context?: string, data?: unknown) {
    this.addLog('error', message, context, data)
    this.originalConsole.error(`[${context || 'ERROR'}]`, message, data || '')
  }

  debug(message: string, context?: string, data?: unknown) {
    this.addLog('debug', message, context, data)
    this.originalConsole.debug(`[${context || 'DEBUG'}]`, message, data || '')
  }

  // Get logs with optional filtering
  getLogs(options?: {
    level?: LogEntry['level'] | LogEntry['level'][]
    context?: string
    limit?: number
    since?: Date
  }): LogEntry[] {
    let filtered = [...this.logs]

    if (options?.level) {
      const levels = Array.isArray(options.level) ? options.level : [options.level]
      filtered = filtered.filter((log) => levels.includes(log.level))
    }

    if (options?.context) {
      filtered = filtered.filter((log) => log.context === options.context)
    }

    if (options?.since) {
      filtered = filtered.filter((log) => log.timestamp >= options.since!)
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit)
    }

    return filtered.reverse() // Most recent first
  }

  // Clear logs
  clearLogs() {
    this.logs = []
  }

  // Get log count
  getLogCount(): number {
    return this.logs.length
  }
}

// Singleton instance
export const logger = new Logger()

// Export convenience functions
export const log = (message: string, context?: string, data?: unknown) => logger.log(message, context, data)
export const logInfo = (message: string, context?: string, data?: unknown) => logger.info(message, context, data)
export const logWarn = (message: string, context?: string, data?: unknown) => logger.warn(message, context, data)
export const logError = (message: string, context?: string, data?: unknown) => logger.error(message, context, data)
export const logDebug = (message: string, context?: string, data?: unknown) => logger.debug(message, context, data)

