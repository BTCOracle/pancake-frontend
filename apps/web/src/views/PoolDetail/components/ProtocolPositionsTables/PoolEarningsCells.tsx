import { useEffect, useMemo } from 'react'

import { useAccount } from 'wagmi'

import { Currency } from '@pancakeswap/swap-sdk-core'
import { CAKE } from '@pancakeswap/tokens'
import { FlexGap, Text } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { formatAmount as formatCurrencyAmount } from '@pancakeswap/utils/formatFractions'
import { Pool } from '@pancakeswap/v3-sdk'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import dayjs from 'dayjs'
import { useUnclaimedFarmRewardsUSDByPoolId, useUnclaimedFarmRewardsUSDByTokenId } from 'hooks/infinity/useFarmReward'
import { useFeesEarnedUSD } from 'hooks/infinity/useFeesEarned'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useV3PositionFees } from 'hooks/v3/useV3PositionFees'
import { formatAmount } from 'utils/formatInfoNumbers'
import { Address } from 'viem'
import { Tooltips } from 'components/Tooltips'
import { useV3CakeEarning } from 'views/universalFarms/hooks/useCakeEarning'
import { usePositionEarningAmount } from 'views/universalFarms/hooks/usePositionEarningAmount'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useSolanaV3RewardInfoFromSimulation } from 'views/universalFarms/hooks/useSolanaV3RewardInfoFromSimulation'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { TokenInfo } from '@pancakeswap/solana-core-sdk'

// Helper function to standardize number conversion
const safeParseFloat = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0
  const parsed = typeof value === 'string' ? parseFloat(value) : value
  return Number.isNaN(parsed) ? 0 : parsed
}

const EarningsUSD = ({ earningsBusd }: { earningsBusd: number }) => {
  return <div>~${formatNumber(earningsBusd)}</div>
}

export const V3EarningsCell = ({
  tokenId,
  chainId,
  pool,
  currency0,
  currency1,
  positionClosed = false,
}: {
  tokenId?: bigint
  chainId: number
  pool?: Pool
  currency0?: Currency
  currency1?: Currency
  positionClosed?: boolean
}) => {
  const { earningsAmount: cakeEarnings, earningsBusd: cakeEarningsUSD } = useV3CakeEarning(
    useMemo(() => (tokenId ? [tokenId] : []), [tokenId]),
    chainId,
  )

  // Get LP fees for V3 position
  const [feeValue0, feeValue1] = useV3PositionFees(
    pool ?? undefined,
    tokenId,
    false,
    // Don't fetch LP Fees if position is closed
    !positionClosed,
  )

  // Get USD prices for fee calculation (cached by the hook)
  const { data: price0Usd } = useCurrencyUsdPrice(currency0 ?? undefined, {
    enabled: Boolean(currency0 && feeValue0?.greaterThan(0)),
  })
  const { data: price1Usd } = useCurrencyUsdPrice(currency1 ?? undefined, {
    enabled: Boolean(currency1 && feeValue1?.greaterThan(0)),
  })

  const feeValue0USD = useMemo(() => {
    return price0Usd && feeValue0 ? safeParseFloat(formatCurrencyAmount(feeValue0)) * price0Usd : undefined
  }, [price0Usd, feeValue0])

  const feeValue1USD = useMemo(() => {
    return price1Usd && feeValue1 ? safeParseFloat(formatCurrencyAmount(feeValue1)) * price1Usd : undefined
  }, [price1Usd, feeValue1])

  const lpFeesUSD = useMemo(() => {
    return feeValue0USD && feeValue1USD ? feeValue0USD + feeValue1USD : undefined
  }, [price0Usd, price1Usd, feeValue0, feeValue1])

  const totalEarnings = cakeEarningsUSD + (lpFeesUSD ?? 0)

  if (positionClosed) {
    return <EarningsUSD earningsBusd={totalEarnings} />
  }

  return (
    <Tooltips
      content={
        <FlexGap flexDirection="column" alignItems="flex-start" gap="8px">
          <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
            <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
              <FlexGap alignItems="center" gap="8px">
                <CurrencyLogo currency={currency0} size="16px" mb="-3px" />
                <Text fontSize="14px" bold>
                  {currency0?.symbol}
                </Text>
              </FlexGap>
              <Text fontSize="14px" bold>
                {formatAmount(Number(feeValue0?.toExact()) ?? 0)}
              </Text>
            </FlexGap>
            <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
              {feeValue0USD && price0Usd ? formatDollarAmount(feeValue0USD) : '$0.00'}
            </Text>
          </FlexGap>
          <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
            <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
              <FlexGap alignItems="center" gap="8px">
                <CurrencyLogo currency={currency1} size="16px" mb="-3px" />
                <Text fontSize="14px" bold>
                  {currency1?.symbol}
                </Text>
              </FlexGap>
              <Text fontSize="14px" bold>
                {formatAmount(Number(feeValue1?.toExact()) ?? 0)}
              </Text>
            </FlexGap>
            <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
              {feeValue1USD && price1Usd ? formatDollarAmount(feeValue1USD) : '$0.00'}
            </Text>
          </FlexGap>
          {cakeEarnings > 0 && (
            <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
              <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                <FlexGap alignItems="center" gap="8px">
                  <CurrencyLogo currency={CAKE[chainId]} size="16px" mb="-3px" />
                  <Text fontSize="14px" bold>
                    CAKE
                  </Text>
                </FlexGap>
                <Text fontSize="14px" bold>
                  {formatAmount(cakeEarnings ?? 0)}
                </Text>
              </FlexGap>
              <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                {cakeEarningsUSD ? formatDollarAmount(cakeEarningsUSD) : '$0.00'}
              </Text>
            </FlexGap>
          )}
        </FlexGap>
      }
    >
      <EarningsUSD earningsBusd={totalEarnings} />
    </Tooltips>
  )
}

export const SolanaV3EarningsCell = ({
  poolInfo,
  position,
  positionClosed = false,
  tokenId,
  onReady,
}: {
  poolInfo: SolanaV3PoolInfo
  position: SolanaV3PositionDetail
  positionClosed?: boolean
  tokenId?: string
  onReady?: (tokenId: string, usd: number) => void
}) => {
  const { breakdownRewardInfo, totalPendingYield } = useSolanaV3RewardInfoFromSimulation({ poolInfo, position })

  const totalUSD = Number(totalPendingYield?.toString?.() ?? 0)

  useEffect(() => {
    if (onReady && tokenId) {
      onReady(tokenId, totalUSD)
    }
  }, [onReady, tokenId, totalUSD])

  if (positionClosed) {
    return <EarningsUSD earningsBusd={totalUSD} />
  }

  const feeA = breakdownRewardInfo.fee.A
  const feeB = breakdownRewardInfo.fee.B
  const { rewards } = breakdownRewardInfo

  return (
    <Tooltips
      content={
        <FlexGap flexDirection="column" alignItems="flex-start" gap="8px">
          {/* LP Fees */}
          {(Number(feeA?.amount || 0) > 0 || Number(feeB?.amount || 0) > 0) && (
            <>
              {feeA?.mint && (
                <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
                  <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                    <FlexGap alignItems="center" gap="8px">
                      <CurrencyLogo
                        currency={convertRawTokenInfoIntoSPLToken(feeA.mint as TokenInfo)}
                        size="16px"
                        mb="-3px"
                      />
                      <Text fontSize="14px" bold>
                        {convertRawTokenInfoIntoSPLToken(feeA.mint as TokenInfo)?.symbol}
                      </Text>
                    </FlexGap>
                    <Text fontSize="14px" bold>
                      {formatAmount(Number(feeA.amount) || 0)}
                    </Text>
                  </FlexGap>
                  <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                    {formatDollarAmount(Number(feeA.amountUSD) || 0)}
                  </Text>
                </FlexGap>
              )}
              {feeB?.mint && (
                <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
                  <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                    <FlexGap alignItems="center" gap="8px">
                      <CurrencyLogo
                        currency={convertRawTokenInfoIntoSPLToken(feeB.mint as TokenInfo)}
                        size="16px"
                        mb="-3px"
                      />
                      <Text fontSize="14px" bold>
                        {convertRawTokenInfoIntoSPLToken(feeB.mint as TokenInfo)?.symbol}
                      </Text>
                    </FlexGap>
                    <Text fontSize="14px" bold>
                      {formatAmount(Number(feeB.amount) || 0)}
                    </Text>
                  </FlexGap>
                  <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                    {formatDollarAmount(Number(feeB.amountUSD) || 0)}
                  </Text>
                </FlexGap>
              )}
            </>
          )}

          {/* Farm Rewards */}
          {rewards && rewards.length > 0 && (
            <>
              {rewards.map((r, idx) =>
                r.mint ? (
                  <FlexGap key={idx} flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
                    <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                      <FlexGap alignItems="center" gap="8px">
                        <CurrencyLogo
                          currency={convertRawTokenInfoIntoSPLToken(r.mint as TokenInfo)}
                          size="16px"
                          mb="-3px"
                        />
                        <Text fontSize="14px" bold>
                          {convertRawTokenInfoIntoSPLToken(r.mint as TokenInfo)?.symbol}
                        </Text>
                      </FlexGap>
                      <Text fontSize="14px" bold>
                        {formatAmount(Number(r.amount) || 0)}
                      </Text>
                    </FlexGap>
                    <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                      {formatDollarAmount(Number(r.amountUSD) || 0)}
                    </Text>
                  </FlexGap>
                ) : null,
              )}
            </>
          )}
        </FlexGap>
      }
    >
      <EarningsUSD earningsBusd={totalUSD} />
    </Tooltips>
  )
}

export const InfinityBinEarningsCell = ({ chainId, poolId }: { chainId?: number; poolId?: Address }) => {
  const { address } = useAccount()
  const {
    data: { rewardsAmount, rewardsUSD },
    isLoading,
  } = useUnclaimedFarmRewardsUSDByPoolId({
    chainId,
    poolId,
    address,
    timestamp: dayjs().startOf('hour').unix(),
  })

  // Standardized amount calculation
  const amount = useMemo(() => {
    if (!rewardsAmount) return 0
    const decimal = Math.min(rewardsAmount.currency.decimals ?? 18, 18)
    return safeParseFloat(rewardsAmount.toFixed(decimal))
  }, [rewardsAmount])

  const [, updatePositionEarningAmount] = usePositionEarningAmount()

  useEffect(() => {
    if (!(chainId && poolId && !isLoading)) {
      return
    }
    updatePositionEarningAmount(chainId, poolId, amount)
  }, [amount, chainId, poolId, isLoading, updatePositionEarningAmount])

  // Note: No Bin LP fees calculation
  return (
    <Tooltips
      content={
        <FlexGap flexDirection="column" alignItems="flex-start" gap="8px">
          {rewardsAmount && rewardsAmount.greaterThan(0) && (
            <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
              <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                <FlexGap alignItems="center" gap="8px">
                  <CurrencyLogo currency={rewardsAmount.currency} size="16px" mb="-3px" />
                  <Text fontSize="14px" bold>
                    {rewardsAmount.currency.symbol}
                  </Text>
                </FlexGap>
                <Text fontSize="14px" bold>
                  {formatAmount(amount)}
                </Text>
              </FlexGap>
              <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                {rewardsUSD ? formatDollarAmount(rewardsUSD) : '$0.00'}
              </Text>
            </FlexGap>
          )}
        </FlexGap>
      }
    >
      <EarningsUSD earningsBusd={rewardsUSD} />
    </Tooltips>
  )
}

export const InfinityCLEarningsCell = ({
  tokenId,
  chainId,
  poolId,
  currency0,
  currency1,
  tickLower,
  tickUpper,
  positionClosed = false,
}: {
  tokenId?: bigint
  chainId?: number
  poolId?: Address
  currency0?: Currency
  currency1?: Currency
  tickLower?: number
  tickUpper?: number
  positionClosed?: boolean
}) => {
  const { address } = useAccount()

  // Get farm rewards
  const {
    data: { rewardsAmount, rewardsUSD },
    isLoading,
  } = useUnclaimedFarmRewardsUSDByTokenId({
    chainId,
    tokenId,
    poolId,
    address,
    timestamp: dayjs().startOf('hour').unix(),
  })

  // Get LP fees
  const {
    totalFiatValue: lpFeesUSD,
    feeAmount0,
    feeAmount1,
    fiatValue0,
    fiatValue1,
  } = useFeesEarnedUSD({
    currency0,
    currency1,
    tokenId,
    poolId,
    tickLower,
    tickUpper,
    enabled: !positionClosed,
  })

  const amount = useMemo(() => {
    if (!rewardsAmount) return 0
    const decimal = Math.min(rewardsAmount.currency.decimals ?? 18, 18)
    return safeParseFloat(rewardsAmount.toFixed(decimal))
  }, [rewardsAmount])

  const [, updatePositionEarningAmount] = usePositionEarningAmount()

  useEffect(() => {
    if (!(chainId && poolId && tokenId && !isLoading)) {
      return
    }
    updatePositionEarningAmount(chainId, poolId, tokenId, amount)
  }, [amount, chainId, poolId, tokenId, isLoading, updatePositionEarningAmount])

  // Standardized LP fee conversion
  const lpFeesUSDValue = useMemo(() => {
    return lpFeesUSD ? safeParseFloat(lpFeesUSD.toExact()) : 0
  }, [lpFeesUSD])

  // Combine farm rewards + LP fees
  const totalEarnings = rewardsUSD + lpFeesUSDValue

  if (positionClosed) {
    return <EarningsUSD earningsBusd={totalEarnings} />
  }

  return (
    <Tooltips
      content={
        <FlexGap flexDirection="column" alignItems="flex-start" gap="8px">
          {feeAmount0 && feeAmount0.greaterThan(0) && (
            <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
              <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                <FlexGap alignItems="center" gap="8px">
                  <CurrencyLogo currency={currency0} size="16px" mb="-3px" />
                  <Text fontSize="14px" bold>
                    {currency0?.symbol}
                  </Text>
                </FlexGap>
                <Text fontSize="14px" bold>
                  {formatAmount(Number(feeAmount0?.toExact()) ?? 0)}
                </Text>
              </FlexGap>
              <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                {fiatValue0 ? formatDollarAmount(safeParseFloat(fiatValue0.toExact())) : '$0.00'}
              </Text>
            </FlexGap>
          )}
          {feeAmount1 && feeAmount1.greaterThan(0) && (
            <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
              <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                <FlexGap alignItems="center" gap="8px">
                  <CurrencyLogo currency={currency1} size="16px" mb="-3px" />
                  <Text fontSize="14px" bold>
                    {currency1?.symbol}
                  </Text>
                </FlexGap>
                <Text fontSize="14px" bold>
                  {formatAmount(Number(feeAmount1?.toExact()) ?? 0)}
                </Text>
              </FlexGap>
              <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                {fiatValue1 ? formatDollarAmount(safeParseFloat(fiatValue1.toExact())) : '$0.00'}
              </Text>
            </FlexGap>
          )}
          {rewardsAmount && rewardsAmount.greaterThan(0) && (
            <FlexGap flexDirection="column" alignItems="flex-start" gap="2px" width="100%">
              <FlexGap alignItems="center" justifyContent="space-between" width="100%" gap="16px">
                <FlexGap alignItems="center" gap="8px">
                  <CurrencyLogo currency={rewardsAmount.currency} size="16px" mb="-3px" />
                  <Text fontSize="14px" bold>
                    {rewardsAmount.currency.symbol}
                  </Text>
                </FlexGap>
                <Text fontSize="14px" bold>
                  {formatAmount(amount)}
                </Text>
              </FlexGap>
              <Text color="textSubtle" fontSize="12px" textAlign="right" width="100%">
                {rewardsUSD ? formatDollarAmount(rewardsUSD) : '$0.00'}
              </Text>
            </FlexGap>
          )}
        </FlexGap>
      }
    >
      <EarningsUSD earningsBusd={totalEarnings} />
    </Tooltips>
  )
}
