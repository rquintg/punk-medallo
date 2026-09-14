type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  requestId?: string
  duration?: number
  data?: Record<string, unknown>
  error?: { name: string; message: string; stack?: string; details?: unknown; hint?: unknown; code?: unknown; status?: unknown; data?: unknown }
}

function serializeError(err: unknown): { name: string; message: string; stack?: string; details?: unknown; hint?: unknown; code?: unknown; status?: unknown; data?: unknown } {
  if (!err) return { name: 'EmptyError', message: String(err) }
  if (typeof err === 'object' && err !== null && 'isAxiosError' in err) {
    const a = err as unknown as { name?: string; message?: string; code?: string; stack?: string; response?: { status?: number; data?: unknown } }
    return { name: a.name ?? 'AxiosError', message: String(a.message ?? ''), code: a.code, status: a.response?.status, data: a.response?.data, stack: a.stack }
  }
  if (typeof err === 'object' && err !== null && 'message' in err && 'code' in err) {
    const e = err as Record<string, unknown>
    return { name: String((e.code as string) ?? 'PostgrestError'), message: String(e.message ?? ''), details: e.details, hint: e.hint, code: e.code, status: e.status, stack: (e as { stack?: string }).stack }
  }
  if (err instanceof Error) {
    const cause = (err as unknown as { cause?: unknown }).cause
    return { name: err.name, message: err.message, stack: err.stack, ...(cause ? { data: serializeError(cause) } : {}) }
  }
  try {
    return { name: 'UnknownObject', message: JSON.stringify(err, Object.getOwnPropertyNames(err as object)), stack: undefined }
  } catch {
    return { name: 'Stringified', message: String(err) }
  }
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
      entry.error = serializeError(opts.error)
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
