import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { Connection, PublicKey } from '@solana/web3.js'
import { shallow } from 'zustand/shallow'
import { ApiV3PoolInfoConcentratedItem, PoolInfoLayout, SqrtPriceMath, PoolFarmRewardInfo } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import { AccountLayout } from '@solana/spl-token-0.4'
import ToPublicKey, { isValidPublicKey } from '@/utils/publicKey'
import { useAppStore } from '@/store'
import { MINUTE_MILLISECONDS } from '@/utils/date'
import logMessage from '@/utils/log'

export interface RemainingReward {
  mint: string
  mintInfo: PoolFarmRewardInfo | undefined
  remaining: string
  remainingDecimal: string
  claimable: () => boolean
}

const fetcher = ([connection, publicKey]: [Connection, string]) => {
  logMessage('rpc: get clmm account info')
  return connection.getAccountInfo(ToPublicKey(publicKey), { commitment: useAppStore.getState().commitment })
}

const fetcherAccount = ([connection, publicKeyList]: [Connection, string[]]) => {
  logMessage('rpc: get multiple clmm account info', publicKeyList.length, 'accounts')
  return connection.getMultipleAccountsInfo(
    publicKeyList.map((p) => ToPublicKey(p)),
    { commitment: useAppStore.getState().commitment }
  )
}

export default function useFetchRpcClmmInfo(props: {
  shouldFetch?: boolean
  id?: string
  apiPoolInfo?: ApiV3PoolInfoConcentratedItem
  refreshInterval?: number
  refreshTag?: number
}) {
  const { shouldFetch = true, id = '', apiPoolInfo, refreshInterval = MINUTE_MILLISECONDS, refreshTag } = props || {}
  const isValidId = isValidPublicKey(id)
  const [connection, publicKey] = useAppStore((s) => [s.connection, s.publicKey], shallow)

  const [poolInfo, setPoolInfo] = useState<(ReturnType<typeof PoolInfoLayout.decode> & { currentPrice: Decimal }) | undefined>()

  const { data, isLoading, error, ...rest } = useSWR(
    shouldFetch && connection && isValidId ? [connection, id, refreshTag] : null,
    fetcher,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )
  const isEmptyResult = shouldFetch && !!id && !isLoading && !(data && !error)

  const ownerRewards = useMemo(
    () => (publicKey && poolInfo ? poolInfo.rewardInfos.filter((r) => r.creator.equals(publicKey)) : []),
    [publicKey, poolInfo]
  )

  const { data: dataReward } = useSWR(
    shouldFetch && connection && publicKey && poolInfo ? [connection, ownerRewards.map((r) => r.tokenVault.toBase58()), refreshTag] : null,
    fetcherAccount,
    {
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval
    }
  )

  const rewardVaultAmount = useMemo(
    () => dataReward?.filter((d) => !!d && d.data.length === AccountLayout.span).map((d) => AccountLayout.decode(d!.data as any)) || [],
    [dataReward]
  )
  const ownerRemainingRewards = useMemo(
    () =>
      rewardVaultAmount.map((r, idx) => {
        const remaining = new Decimal(r.amount.toString()).sub(ownerRewards[idx].rewardTotalEmissioned.toString())
        const rewardInfo = apiPoolInfo?.rewardDefaultInfos.find((pr) => pr.mint.address === r.mint.toBase58())
        return {
          hasRemaining: remaining.gt(0),
          mint: r.mint.toBase58(),
          mintInfo: rewardInfo?.mint,
          remaining: remaining.toString(),
          remainingDecimal: remaining.div(10 ** (rewardInfo?.mint.decimals || 0)).toString()
        }
      }),
    [rewardVaultAmount, ownerRewards, apiPoolInfo?.id]
  )

  useEffect(() => {
    if (data) {
      const layoutAccountInfo = PoolInfoLayout.decode(data.data)
      const currentPrice = SqrtPriceMath.sqrtPriceX64ToPrice(
        layoutAccountInfo.sqrtPriceX64,
        layoutAccountInfo.mintDecimalsA,
        layoutAccountInfo.mintDecimalsB
      )

      setPoolInfo({
        ...layoutAccountInfo,
        currentPrice
      })
    } else {
      setPoolInfo(undefined)
    }
  }, [data])

  return {
    id: id ? new PublicKey(id) : undefined,
    programId: data?.owner,
    data: poolInfo,
    ownerRemainingRewards,
    isLoading,
    error,
    isEmptyResult,
    ...rest
  }
}
