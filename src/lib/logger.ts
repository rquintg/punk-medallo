type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  requestId?: string
  duration?: number
  data?: Record<string, unknown>
  error?: { name: string; message: string; stack?: string }
}

let requestIdCounter = 0

export function generateRequestId(): string {
  requestIdCounter++
  return `req_${Date.now()}_${requestIdCounter}`
}

function formatLog(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.requestId ? `[${entry.requestId}]` : '',
    entry.message,
  ]
  const line = parts.filter(Boolean).join(' ')

  if (entry.data && Object.keys(entry.data).length > 0) {
    return `${line} ${JSON.stringify(entry.data)}`
  }
  if (entry.error) {
    return `${line} ${JSON.stringify(entry.error)}`
  }
  return line
}

function createLogFn(level: LogLevel) {
  return (message: string, opts?: { requestId?: string; duration?: number; data?: Record<string, unknown>; error?: unknown }) => {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId: opts?.requestId,
      duration: opts?.duration,
      data: opts?.data,
    }

    if (opts?.error) {
      const err = opts.error instanceof Error ? opts.error : new Error(String(opts.error))
      entry.error = { name: err.name, message: err.message, stack: err.stack }
    }

    const formatted = formatLog(entry)

    if (level === 'error') {
      console.error(formatted)
    } else if (level === 'warn') {
      console.warn(formatted)
    } else {
      console.log(formatted)
    }
  }
}

export const logger = {
  info: createLogFn('info'),
  warn: createLogFn('warn'),
  error: createLogFn('error'),
}

export function logRequestStart(requestId: string, method: string, path: string, data?: Record<string, unknown>) {
  logger.info(`→ ${method} ${path}`, { requestId, data })
}

export function logRequestEnd(requestId: string, method: string, path: string, status: number, duration: number) {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
  logger[level](`← ${method} ${path} ${status}`, { requestId, duration: Math.round(duration) })
}
