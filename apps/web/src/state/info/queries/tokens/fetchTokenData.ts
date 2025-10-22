import { explorerApiClient } from 'state/info/api/client'
import { components } from 'state/info/api/schema'
import { TokenDataForView } from 'state/info/types'
import { getPercentChange } from 'utils/infoDataHelpers'

export async function fetchedTokenData(
  chainName: components['schemas']['ChainName'],
  tokenAddress: string,
  signal?: AbortSignal,
): Promise<{
  error: boolean
  data: TokenDataForView | undefined
}> {
  try {
    const data = await explorerApiClient
      .GET('/cached/tokens/v3/{chainName}/{address}', {
        signal,
        params: {
          path: {
            chainName,
            address: tokenAddress,
          },
        },
      })
      .then((res) => res.data)

    if (!data) {
      return {
        error: false,
        data: undefined,
      }
    }

    const volumeUSD = data.volumeUSD24h ? parseFloat(data.volumeUSD24h) : 0

    const volumeOneWindowAgo =
      data.volumeUSD24h && data.volumeUSD48h ? parseFloat(data.volumeUSD48h) - parseFloat(data.volumeUSD24h) : undefined

    const volumeUSDChange = volumeUSD && volumeOneWindowAgo ? getPercentChange(volumeUSD, volumeOneWindowAgo) : 0

    const volumeUSDWeek = data.volumeUSD7d ? parseFloat(data.volumeUSD7d) : 0

    const tvlUSD = data.tvlUSD ? parseFloat(data.tvlUSD) : 0
    const tvlUSDChange = getPercentChange(
      data.tvlUSD ? parseFloat(data.tvlUSD) : undefined,
      data.tvlUSD24h ? parseFloat(data.tvlUSD24h) : undefined,
    )
    const decimals = data.decimals ?? 0
    const tvlToken = data.tvl ? parseFloat(data.tvl) : 0
    const priceUSD = data.priceUSD ? parseFloat(data.priceUSD) : 0
    const priceUSDOneDay = data.priceUSD24h ? parseFloat(data.priceUSD24h) : 0
    const priceUSDWeek = data.priceUSD7d ? parseFloat(data.priceUSD7d) : 0
    const priceUSDChange = priceUSD && priceUSDOneDay ? getPercentChange(priceUSD, priceUSDOneDay) : 0
    const priceUSDChangeWeek = priceUSD && priceUSDWeek ? getPercentChange(priceUSD, priceUSDWeek) : 0

    const txCount = data.txCount24h ?? 0

    const feesUSD = parseFloat(data.feeUSD24h) ?? 0

    return {
      error: false,
      data: {
        exists: !!data,
        address: data.id,
        name: data?.name ?? '',
        symbol: data?.symbol ?? '',
        decimals,
        volumeUSD,
        volumeUSDChange,
        volumeUSDWeek,
        txCount,
        tvlUSD,
        feesUSD,
        tvlUSDChange,
        tvlToken,
        priceUSD,
        priceUSDChange,
        priceUSDChangeWeek,
      },
    }
  } catch (e) {
    return {
      error: true,
      data: undefined,
    }
  }
}
