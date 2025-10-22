import { getCookieKey } from 'config/experimentalFeatures'
import { NextFetchEvent, NextResponse } from 'next/server'

import { getExperimentalFeatureAccessList } from '../flags'
import { ONE_YEAR_SECONDS } from './constants'
import { ExtendedNextReq, MiddlewareFactory, NextMiddleware } from './types'

export const withABTesting: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: ExtendedNextReq, _next: NextFetchEvent) => {
    const clientId = request?.clientId
    const response = (await next(request, _next)) || NextResponse.next()

    if (!clientId) return response

    const accessList = await getExperimentalFeatureAccessList(request)

    for (const { feature, hasAccess } of accessList) {
      response.cookies.set(getCookieKey(feature), hasAccess.toString(), {
        secure: true,
        maxAge: hasAccess ? ONE_YEAR_SECONDS : 0,
      })
    }
    return response
  }
}
