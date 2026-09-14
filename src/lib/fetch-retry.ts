export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {},
  opts: { retries?: number; baseDelayMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 8000, retries = 2, baseDelayMs = 500, ...fetchInit } = { ...init, ...opts } as RequestInit & { timeoutMs?: number; retries?: number; baseDelayMs?: number }
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(input, { ...fetchInit, signal: controller.signal })
      clearTimeout(timeout)
      if (res.status === 429 || res.status === 503 || res.status === 502) {
        const retryAfter = res.headers.get('retry-after')
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : baseDelayMs * Math.pow(2, attempt) + Math.random() * 200
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
      }
      return res
    } catch (err) {
      clearTimeout(timeout)
      lastError = err
      if (attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 200
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw lastError
    }
  }
  throw lastError
}
