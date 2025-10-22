import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Price, Token } from '@pancakeswap/swap-sdk-core'
import { PairDataTimeWindowEnum, UseModalV2Props } from '@pancakeswap/uikit'
import { encodeSqrtRatioX96, parseProtocolFees, TickMath } from '@pancakeswap/v3-sdk'
import { RoiCalculatorModalV2 } from '@pancakeswap/widgets-internal/roi'
import BigNumber from 'bignumber.js'
import { useCakePrice } from 'hooks/useCakePrice'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { usePairTokensPrice } from 'hooks/v3/usePairTokensPrice'
import { useAllV3Ticks } from 'hooks/v3/usePoolTickData'
import { useMemo, useState } from 'react'
import { CakeApr } from 'state/farmsV4/atom'
import { type PositionInfo } from 'state/farmsV4/hooks'
import { InfinityCLPositionDetail, PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { PoolInfo } from 'state/farmsV4/state/type'
import { getActiveTick } from 'utils/getActiveTick'
import { CurrencyField } from 'utils/types'
import { useLmPoolLiquidity } from 'views/Farms/hooks/useLmPoolLiquidity'

export type BasicPoolAprModalProps<T extends InfinityCLPositionDetail | PositionDetail = PositionDetail> = {
  modal: UseModalV2Props
  poolInfo: PoolInfo
  cakeApr?: CakeApr[keyof CakeApr]
  lpApr?: number
  positionDetail?: T
}

type PoolAprModalProps = BasicPoolAprModalProps & {
  position?: Pick<PositionInfo, 'amount0' | 'amount1' | 'priceLower' | 'priceUpper'>
  price?: Price<Currency | Token, Currency | Token>
  currencyBalances: { [field in CurrencyField]?: CurrencyAmount<Currency> }
  feeProtocol?: number
  liquidity?: bigint
}

export const BasicAPRModal: React.FC<PoolAprModalProps> = ({
  modal,
  poolInfo,
  positionDetail,
  cakeApr,
  position,
  currencyBalances,
  price,
  feeProtocol,
  liquidity,
}) => {
  const { t } = useTranslation()
  const cakePrice = useCakePrice()
  const { data: token0PriceUsd } = useCurrencyUsdPrice(poolInfo.token0 as Currency, { enabled: !!poolInfo.token0 })
  const { data: token1PriceUsd } = useCurrencyUsdPrice(poolInfo.token1 as Currency, { enabled: !!poolInfo.token1 })
  const [priceTimeWindow, setPriceTimeWindow] = useState(PairDataTimeWindowEnum.DAY)
  const sqrtRatioX96 = useMemo(() => price && encodeSqrtRatioX96(price.numerator, price.denominator), [price])
  const tickCurrent = useMemo(
    () => (sqrtRatioX96 ? TickMath.getTickAtSqrtRatio(sqrtRatioX96) : undefined),
    [sqrtRatioX96],
  )
  const activeTick = useMemo(() => getActiveTick(tickCurrent, poolInfo.feeTier), [tickCurrent, poolInfo.feeTier])
  const { ticks: ticksData } = useAllV3Ticks({
    currencyA: poolInfo.token0 as Currency,
    currencyB: poolInfo.token1 as Currency,
    feeAmount: poolInfo.feeTier,
    activeTick,
    enabled: modal.isOpen,
  })
  const prices = usePairTokensPrice(poolInfo?.lpAddress, priceTimeWindow, poolInfo?.chainId, modal.isOpen)
  const depositUsdAsBN = useMemo(
    () =>
      token0PriceUsd &&
      token1PriceUsd &&
      new BigNumber(position?.amount0?.toExact() ?? 0)
        .times(token0PriceUsd)
        .plus(new BigNumber(position?.amount1?.toExact() ?? 0).times(token1PriceUsd))
        .plus(
          new BigNumber(currencyBalances?.CURRENCY_A?.toExact() ?? 0)
            .times(token0PriceUsd)
            .plus(new BigNumber(currencyBalances?.CURRENCY_B?.toExact() ?? 0).times(token1PriceUsd)),
        ),
    [currencyBalances.CURRENCY_A, currencyBalances.CURRENCY_B, token0PriceUsd, token1PriceUsd, position],
  )
  const lmPoolLiquidity = useLmPoolLiquidity(poolInfo.lpAddress as `0x${string}`, poolInfo.chainId)
  const cakeAprFactor = useMemo(() => {
    if (!cakeApr?.poolWeight || !cakeApr?.cakePerYear) return new BigNumber(0)

    return new BigNumber(cakeApr.poolWeight)
      .times(cakeApr?.cakePerYear)
      .times(cakePrice)
      .div(
        new BigNumber(Number(lmPoolLiquidity) ?? 0).plus(
          positionDetail?.liquidity ? positionDetail?.liquidity.toString() : 0,
        ),
      )
      .times(100)
  }, [cakeApr?.cakePerYear, cakeApr?.poolWeight, cakePrice, lmPoolLiquidity, positionDetail?.liquidity])

  const [protocolFee] = useMemo(() => (feeProtocol && parseProtocolFees(feeProtocol)) || [], [feeProtocol])

  return (
    <RoiCalculatorModalV2
      {...modal}
      isFarm={positionDetail?.isStaked || poolInfo.isFarming}
      maxLabel={positionDetail ? t('My Position') : undefined}
      depositAmountInUsd={depositUsdAsBN?.toString()}
      max={depositUsdAsBN?.toString()}
      price={price}
      currencyA={poolInfo.token0.wrapped as Currency}
      currencyB={poolInfo.token1.wrapped as Currency}
      currencyAUsdPrice={token0PriceUsd}
      currencyBUsdPrice={token1PriceUsd}
      sqrtRatioX96={sqrtRatioX96}
      liquidity={liquidity}
      customCakeApr={new BigNumber(cakeApr?.value ?? 0).times(100)}
      feeAmount={poolInfo.feeTier}
      ticks={ticksData}
      volume24H={Number(poolInfo.vol24hUsd) || 0}
      priceUpper={position?.priceUpper}
      priceLower={position?.priceLower}
      cakePrice={cakePrice.toFixed(3)}
      cakeAprFactor={cakeAprFactor}
      prices={prices}
      priceSpan={priceTimeWindow}
      protocolFee={protocolFee}
      onPriceSpanChange={setPriceTimeWindow}
      closeOnOverlayClick
    />
  )
}
