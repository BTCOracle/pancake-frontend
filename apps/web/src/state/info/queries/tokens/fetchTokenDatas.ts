import { GraphQLClient } from 'graphql-request'

import { Block, TokenDataForView, TokenDataResponse, TokenFields } from 'state/info/types'
import { getPercentChange } from 'utils/infoDataHelpers'

import { get2DayChange } from 'state/info/utils'
import { fetchEthPrices } from './fetchEthPrices'
import { fetchTokensBulk } from './fetchTokensBulk'

export async function fetchedTokenDatas(
  dataClient: GraphQLClient,
  tokenAddresses: string[],
  blocks?: Block[],
): Promise<{
  error: boolean
  data:
    | {
        [address: string]: TokenDataForView
      }
    | undefined
}> {
  const [block24, block48, blockWeek] = blocks ?? []

  try {
    const { data: ethPrices } = await fetchEthPrices(dataClient, blocks)

    const data = await dataClient.request<TokenDataResponse>(fetchTokensBulk(undefined, tokenAddresses))

    const data24 = await dataClient.request<TokenDataResponse>(fetchTokensBulk(block24?.number, tokenAddresses))

    const data48 = await dataClient.request<TokenDataResponse>(fetchTokensBulk(block48?.number, tokenAddresses))

    const dataWeek = await dataClient.request<TokenDataResponse>(fetchTokensBulk(blockWeek?.number, tokenAddresses))
    if (!ethPrices) {
      return {
        error: false,
        data: undefined,
      }
    }

    const parsed = data?.tokens
      ? data.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
          // eslint-disable-next-line no-param-reassign
          accum[poolData.id] = poolData
          return accum
        }, {})
      : {}
    const parsed24 = data24?.tokens
      ? data24.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
          // eslint-disable-next-line no-param-reassign
          accum[poolData.id] = poolData
          return accum
        }, {})
      : {}
    const parsed48 = data48?.tokens
      ? data48.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
          // eslint-disable-next-line no-param-reassign
          accum[poolData.id] = poolData
          return accum
        }, {})
      : {}
    const parsedWeek = dataWeek?.tokens
      ? dataWeek.tokens.reduce((accum: { [address: string]: TokenFields }, poolData) => {
          // eslint-disable-next-line no-param-reassign
          accum[poolData.id] = poolData
          return accum
        }, {})
      : {}

    // format data and calculate daily changes
    const formatted = tokenAddresses.reduce((accum: { [address: string]: TokenDataForView }, address) => {
      const current: TokenFields | undefined = parsed[address]
      const oneDay: TokenFields | undefined = parsed24[address]
      const twoDay: TokenFields | undefined = parsed48[address]
      const week: TokenFields | undefined = parsedWeek[address]

      const [volumeUSD, volumeUSDChange] =
        current && oneDay && twoDay
          ? get2DayChange(current.volumeUSD, oneDay.volumeUSD, twoDay.volumeUSD)
          : current
          ? [parseFloat(current.volumeUSD), 0]
          : [0, 0]

      const volumeUSDWeek =
        current && week
          ? parseFloat(current.volumeUSD) - parseFloat(week.volumeUSD)
          : current
          ? parseFloat(current.volumeUSD)
          : 0
      const tvlUSD = current ? parseFloat(current.totalValueLockedUSD) : 0
      const tvlUSDChange = getPercentChange(
        parseFloat(current?.totalValueLockedUSD),
        parseFloat(oneDay?.totalValueLockedUSD),
      )
      const decimals = current ? parseFloat(current.decimals) : 0
      const tvlToken = current ? parseFloat(current.totalValueLocked) : 0
      const priceUSD = current ? parseFloat(current.derivedETH) * ethPrices.current : 0
      const priceUSDOneDay = oneDay ? parseFloat(oneDay.derivedETH) * ethPrices.oneDay : 0
      const priceUSDWeek = week ? parseFloat(week.derivedETH) * ethPrices.week : 0
      const priceUSDChange = priceUSD && priceUSDOneDay ? getPercentChange(priceUSD, priceUSDOneDay) : 0

      const priceUSDChangeWeek = priceUSD && priceUSDWeek ? getPercentChange(priceUSD, priceUSDWeek) : 0
      const txCount =
        current && oneDay
          ? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
          : current
          ? parseFloat(current.txCount)
          : 0
      const feesUSD =
        current && oneDay
          ? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD)
          : current
          ? parseFloat(current.feesUSD)
          : 0

      // eslint-disable-next-line no-param-reassign
      accum[address] = {
        exists: !!current,
        address,
        name: current?.name ?? '',
        symbol: current?.symbol ?? '',
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
      }

      return accum
    }, {})

    return {
      error: false,
      data: formatted,
    }
  } catch (e) {
    return {
      error: true,
      data: undefined,
    }
  }
}
