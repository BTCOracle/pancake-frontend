import { ChainId } from '@pancakeswap/chains'
import { OnChainProvider } from '@pancakeswap/smart-router'
import { getCorsHeaders, handleCors } from 'edge/cors'
import { queryTokenPrice } from 'edge/tokenPrice'
import { NextRequest, NextResponse } from 'next/server'
import { getViemClients } from 'utils/viem.server'
import { Address } from 'viem/accounts'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const cors = handleCors(req)
  if (cors) {
    return cors
  }
  const { searchParams } = new URL(req.url)
  const chainId = Number(searchParams.get('chainId'))
  const address = searchParams.get('address')
  const isNative = searchParams.get('native') === 'true'

  if (!chainId || (address == null && !isNative)) {
    return NextResponse.json({ error: 'invalid query' }, { status: 400, headers: getCorsHeaders(req) })
  }

  try {
    const queryResult = await queryTokenPrice(
      {
        chainId: chainId as ChainId,
        address: address as Address,
        isNative,
      },
      getViemClients as OnChainProvider,
    )
    if (!queryResult) {
      return NextResponse.json({ error: 'price not found' }, { status: 404, headers: getCorsHeaders(req) })
    }
    const { price, from } = queryResult
    return NextResponse.json(
      { priceUSD: price, from, lastUpdated: Number(Date.now()) },
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
    return NextResponse.json({ error: `fetch token price error` }, { status: 400, headers: getCorsHeaders(req) })
  }
}
