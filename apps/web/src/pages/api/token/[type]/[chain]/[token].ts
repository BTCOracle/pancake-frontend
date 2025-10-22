import { getCorsHeaders, handleCors } from 'edge/cors'
import { queryTokenInfo } from 'edge/tokenInfo'
import { NextRequest, NextResponse } from 'next/server'

type SupportedType = 'swap' | 'v3' | 'stableSwap'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const cors = handleCors(req)
  if (cors) {
    return cors
  }

  const { pathname } = new URL(req.url)
  const parts = pathname.split('/').filter(Boolean)
  const token = parts.pop()
  const chain = parts.pop()
  const type = parts.pop() as SupportedType | undefined

  const result = await queryTokenInfo(chain, token, type)

  return NextResponse.json(result, {
    status: 200,
    headers: {
      'Cache-Control': `public, s-maxage=300, stale-while-revalidate=3600`,
      'Content-Type': 'application/json',
      ...getCorsHeaders(req),
    },
  })
}
