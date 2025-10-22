import { ChainId } from '@pancakeswap/chains'
import { getAddress } from 'viem'

const CHAIN_TO_QUERY = {
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.BSC]: 'bsc',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.ZKSYNC]: 'zksync',
  [ChainId.LINEA]: 'linea',
  [ChainId.BASE]: 'base',
  [ChainId.OPBNB]: 'opbnb',
} as const

const requireCheck = [EXPLORER_API_KEY]
requireCheck.forEach((node) => {
  if (!node) {
    throw new Error('Missing env var')
  }
})

export async function getPoolsTvlFromExplorerAPI({ chainId }: { chainId: ChainId }) {
  const chain = (CHAIN_TO_QUERY as any)[chainId]
  const pageSize = 50
  let hasMorePools = true
  let endCursor = ''
  let pools: any[] = []
  while (hasMorePools) {
    // eslint-disable-next-line no-await-in-loop
    const res = await fetch(
      `https://explorer.pancakeswap.com/api/cached/pools/list?orderBy=tvlUSD&protocols=v3&chains=${chain}${
        endCursor ? `&after=${endCursor}` : ''
      }`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': EXPLORER_API_KEY,
        },
      },
    )
    // eslint-disable-next-line no-await-in-loop
    const data: any = await res.json()
    if (data.rows.length < pageSize) {
      hasMorePools = false
      pools = [...pools, ...data.rows]
      break
    }
    endCursor = data.endCursor
    pools = [...pools, ...data.rows]
  }

  return pools.map((p) => ({
    address: getAddress(p.id),
    tvlUSD: String(Math.floor(Number(p.tvlUSD))),
  }))
}
