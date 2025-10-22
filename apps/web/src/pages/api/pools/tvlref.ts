import type { FarmV4SupportedChainId } from '@pancakeswap/farms'
import { getCorsHeaders, handleCors } from 'edge/cors'
import { NextRequest, NextResponse } from 'next/server'
import { edgeQueries } from 'quoter/utils/edgePoolQueries'
import { getEdgeChainName, parseTvQuery } from 'quoter/utils/edgeQueries.util'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const cors = handleCors(req)
  if (cors) {
    return cors
  }
  const raw = new URL(req.url).search.slice(1)
  try {
    const { chainId, protocols } = parseTvQuery(raw)
    const chain = getEdgeChainName(chainId as FarmV4SupportedChainId)
    if (!chain) {
      return NextResponse.json({ error: `invalid chainId` }, { status: 400 })
    }
    const tvl = await edgeQueries.poolTvlMap(protocols, chain)
    return NextResponse.json(
      {
        data: tvl,
        lastUpdated: Number(Date.now()),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=60, stale-while-revalidate=60`,
          'Content-Type': 'application/json',
          ...getCorsHeaders(req),
        },
      },
    )
  } catch (ex) {
    console.error(ex)
    return NextResponse.json({ error: `fetch tvl error` }, { status: 400, headers: getCorsHeaders(req) })
  }
}
