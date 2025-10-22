import { shallow } from 'zustand/shallow'
import { solToWSol, WSOLMint } from '@pancakeswap/solana-core-sdk'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import useSWR from 'swr'
import axios from '@/api/axios'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import { isValidPublicKey } from '@/utils/publicKey'
import { useAppStore } from '@/store'

export interface BirdEyeTokenPrice {
  value: number
  updateUnixTime: number
  updateHumanTime: string
  priceChange24h: number
}

const fetcher = ([url, mintList]: [string, string]): Promise<{
  success: boolean
  data: { [key: string]: BirdEyeTokenPrice }
}> => {
  return axios.get(`${url}?list_address=${mintList}`, {
    skipError: true
  })
}

export default function useBirdeyeTokenPrice(props: {
  mintList: (string | PublicKey | undefined)[]
  refreshInterval?: number
  timeout?: number
}) {
  const [host, birdeyePriceUrl] = useAppStore((s) => [s.urlConfigs.BASE_HOST, s.urlConfigs.BIRDEYE_TOKEN_PRICE], shallow)
  const { mintList, refreshInterval = 2 * MINUTE_MILLISECONDS } = props || {}

  const readyList = useMemo(
    () => Array.from(new Set(mintList.filter((m) => !!m && isValidPublicKey(m)).map((m) => solToWSol(m!).toString()))),
    [JSON.stringify(mintList)]
  )

  const shouldFetch = readyList.length > 0

  const { data, isLoading, error, ...rest } = useSWR(shouldFetch ? [`${host}${birdeyePriceUrl}`, readyList.join(',')] : null, fetcher, {
    refreshInterval,
    dedupingInterval: refreshInterval,
    focusThrottleInterval: refreshInterval
  })
  const isEmptyResult = !isLoading && !(data && !error)

  if (data?.data && data?.success) {
    data.data[PublicKey.default.toBase58()] = data.data[WSOLMint.toBase58()]
  }

  return {
    data: data?.success ? data?.data : {},
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
