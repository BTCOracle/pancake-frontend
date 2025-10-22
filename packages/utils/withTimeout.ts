interface WithTimeoutOptions {
  ms: number
  abort?: () => void
}
export function withTimeout<Args extends any[], Return>(
  fn: (...args: Args) => Promise<Return>,
  options: WithTimeoutOptions,
): (...args: Args) => Promise<Return> {
  const { ms, abort } = options
  return async (...args: Args): Promise<Return> => {
    let timer: ReturnType<typeof setTimeout>
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new TimeoutError(ms))
      }, ms)
    })

    try {
      return await Promise.race([fn(...args), timeoutPromise])
    } catch (ex) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Error in withTimeout:', ex)
      }
      throw ex
    } finally {
      abort?.()
      clearTimeout(timer!)
    }
  }
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`)
  }
}
