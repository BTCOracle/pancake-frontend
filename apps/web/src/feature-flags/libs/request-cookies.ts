// copied from Next.js, and reduced
// https://github.com/vercel/next.js/tree/canary/packages/next/src/server/web/spec-extension
import { RequestCookies, ResponseCookies } from '../cookies'
import { ReflectAdapter } from './reflect'

/**
 * @internal
 */
export class ReadonlyRequestCookiesError extends Error {
  constructor() {
    super(
      'Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options',
    )
  }

  public static callable() {
    throw new ReadonlyRequestCookiesError()
  }
}

// We use this to type some APIs but we don't construct instances directly
export type { ResponseCookies }

// The `cookies()` API is a mix of request and response cookies. For `.get()` methods,
// we want to return the request cookie if it exists. For mutative methods like `.set()`,
// we want to return the response cookie.
export type ReadonlyRequestCookies = Omit<RequestCookies, 'set' | 'clear' | 'delete'> &
  Pick<ResponseCookies, 'set' | 'delete'>

export class RequestCookiesAdapter {
  public static seal(cookies: RequestCookies): ReadonlyRequestCookies {
    return new Proxy(cookies as any, {
      get(target, prop, receiver) {
        switch (prop) {
          case 'clear':
          case 'delete':
          case 'set':
            return ReadonlyRequestCookiesError.callable
          default:
            return ReflectAdapter.get(target, prop, receiver)
        }
      },
    })
  }
}
