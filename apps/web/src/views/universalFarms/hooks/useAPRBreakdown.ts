import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { bscTokens } from '@pancakeswap/tokens'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { IRewardCardProps } from '@pancakeswap/widgets-internal/liquidity'
import BigNumber from 'bignumber.js'
import { DAY_PER_YEAR } from 'config'
import { useCakePrice } from 'hooks/useCakePrice'
import { useMemo } from 'react'
import { CakeApr } from 'state/farmsV4/atom'
import { ChainIdAddressKey } from 'state/farmsV4/state/type'
import { Address } from 'viem'

export interface APRBreakdownProps {
  currency0?: Currency
  currency1?: Currency
  poolId?: Address
  lpApr: `${number}`
  cakeApr: CakeApr[ChainIdAddressKey]
  merklApr?: `${number}`
  incentraApr?: `${number}`
  tvlUSD?: `${number}`
}

export const useAPRBreakdown = ({ currency0, currency1, lpApr, cakeApr, tvlUSD: tvlUSD_ }: APRBreakdownProps) => {
  const { t } = useTranslation()
  const tvlUSD = tvlUSD_ ?? cakeApr.userTvlUsd

  const cakePrice = useCakePrice()

  const LPRewardPerday = useMemo(() => {
    if (!lpApr || !tvlUSD) return '0'
    return formatNumber(new BigNumber(lpApr).times(tvlUSD).dividedBy(DAY_PER_YEAR), {
      maximumSignificantDigits: 4,
    })
  }, [lpApr, tvlUSD])

  const farmingRewardPerday = useMemo(() => {
    if (!cakeApr || !tvlUSD || !cakePrice) return '0'
    return formatNumber(new BigNumber(cakeApr.value).times(tvlUSD).dividedBy(DAY_PER_YEAR).dividedBy(cakePrice), {
      maximumSignificantDigits: 4,
    })
  }, [cakeApr, tvlUSD, cakePrice])

  return useMemo(
    () =>
      [
        { apr: lpApr, currency: [currency0, currency1], title: t('LP Fee'), rewardPerDay: `Avg. $${LPRewardPerday}` },
        {
          apr: cakeApr.value,
          currency: bscTokens.cake,
          title: 'CAKE',
          rewardPerDay: `${farmingRewardPerday} ${bscTokens.cake?.symbol}`,
        },
      ] as IRewardCardProps['rewards'],
    [t, lpApr, cakeApr.value, currency0, currency1, LPRewardPerday, farmingRewardPerday],
  )
}
