import { type Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getViemClients } from 'utils/viem'
import { useCurrency } from 'hooks/Tokens'
import { useAtomValue } from 'jotai'
import { ifoInfoAtom, ifoPoolsAtom } from 'views/Cakepad/atom/ifo.atoms'
import { useIfoV2Context } from 'views/Cakepad/contexts/useIfoV2Context'
import { ifoVersionAtom } from 'views/Cakepad/atom/ifoVersionAtom'
import { getStatusByTimestamp } from '../helpers'
import { useVestingInfo } from './useVestingInfo'
import type { IfoInfo } from '../../ifov2.types'
import { useIFOAddresses } from './useIFOAddresses'
import { useIFOPoolInfo } from './useIFOPoolInfo'

export const useIFOInfo = () => {
  const { config } = useIfoV2Context()
  return useAtomValue(ifoInfoAtom(config.id))!
}

export const useIFOInfoCtx = () => {
  const pools = useIFOPoolInfo()
  const pool0Info = pools[0]
  const pool1Info = pools[1]
  const { data: addresses } = useIFOAddresses()
  const offeringCurrency = useCurrency(addresses?.offeringToken)
  const { chainId } = useActiveChainId()
  const vestingInfo = useVestingInfo()
  const { ifoContract } = useIfoV2Context()
  const version = useAtomValue(ifoVersionAtom)
  const { data: timestamps } = useQuery({
    queryKey: ['ifoTimestamps', chainId, version, ifoContract.address],
    queryFn: async (): Promise<{ startTimestamp: number; endTimestamp: number }> => {
      const publicClient = getViemClients({ chainId })
      if (!ifoContract || !publicClient) throw new Error('IFO contract not found')
      const [startTimestamp, endTimestamp] = await publicClient.multicall({
        contracts: [
          { address: ifoContract.address, abi: ifoContract.abi, functionName: 'startTimestamp' },
          { address: ifoContract.address, abi: ifoContract.abi, functionName: 'endTimestamp' },
        ],
        allowFailure: false,
      })
      return { startTimestamp: Number(startTimestamp), endTimestamp: Number(endTimestamp) }
    },
    enabled: !!ifoContract,
  })
  const now = dayjs().unix()

  return useMemo<IfoInfo>(() => {
    const info = {
      startTimestamp: timestamps?.startTimestamp ?? 0,
      endTimestamp: timestamps?.endTimestamp ?? 0,
      duration:
        timestamps?.endTimestamp && timestamps?.startTimestamp
          ? timestamps.endTimestamp - timestamps.startTimestamp
          : 0,
      totalSalesAmount: offeringCurrency
        ? CurrencyAmount.fromRawAmount(offeringCurrency, pool0Info?.offeringAmountPool ?? 0n).add(
            CurrencyAmount.fromRawAmount(offeringCurrency, pool1Info?.offeringAmountPool ?? 0n),
          )
        : undefined,
      status: getStatusByTimestamp(now, timestamps?.startTimestamp, timestamps?.endTimestamp),
      vestingInfo,
      offeringCurrency,
    } as IfoInfo
    return info
  }, [
    pool0Info?.offeringAmountPool,
    pool1Info?.offeringAmountPool,
    timestamps?.startTimestamp,
    timestamps?.endTimestamp,
    vestingInfo,
    offeringCurrency,
    now,
  ])
}
