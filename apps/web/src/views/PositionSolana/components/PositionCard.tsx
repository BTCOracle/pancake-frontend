import React, { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { TokenInfo, wSolToSolToken } from '@pancakeswap/solana-core-sdk'
import {
  AutoColumn,
  Card,
  CardBody,
  CardProps,
  Flex,
  FlexGap,
  PreTitle,
  RowBetween,
  Text,
  TokenLogo,
} from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { formatPercent } from '@pancakeswap/utils/formatFractions'
import BN from 'bn.js'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { getCurrencyLogoSrcs } from 'components/TokenImage'
import { useLiquidityAmount, useLiquidityDepositRatio } from 'hooks/solana/useLiquidityAmount'
import { useLiquidityUsdValue } from 'hooks/solana/useLiquidityUsdValue'
import { useSolanaV3RewardInfoFromSimulation } from 'views/universalFarms/hooks/useSolanaV3RewardInfoFromSimulation'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import Divider from 'components/Divider'
import { formatFiatNumber } from '@pancakeswap/utils/formatFiatNumber'
import { SolanaV3PositionActions } from 'views/universalFarms/components/PositionActions/SolanaV3PositionActions'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useIsV3PositionOwner } from 'state/token/solanaPositionOwner'

export interface PositionCardProps {
  position: SolanaV3PositionDetail
  poolInfo: SolanaV3PoolInfo
}

const BalanceBar = styled.div<{ ratio: number }>`
  width: 100%;
  height: 8px;
  background: linear-gradient(
    to right,
    ${({ theme, ratio }) => theme.colors.primary} 0% ${({ ratio }) => ratio}%,
    ${({ theme, ratio }) => theme.colors.secondary} ${({ ratio }) => ratio}% 100%
  );
  border-radius: 4px;
  margin: 8px 0;
`

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

const EarningsSection = styled.div``

const EarningsTokenList = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
`

const EarningsTokenItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 120px;
`

export const PositionCard: React.FC<PositionCardProps & CardProps> = ({ position, poolInfo, ...props }) => {
  const { t } = useTranslation()
  const { solanaAccount } = useAccountActiveChain()
  const { isOwner } = useIsV3PositionOwner(position.nftMint.toBase58(), solanaAccount)

  const currency0 = useMemo(
    () => convertRawTokenInfoIntoSPLToken(wSolToSolToken(poolInfo.rawPool.mintA as TokenInfo)),
    [poolInfo.rawPool.mintA],
  )
  const currency1 = useMemo(
    () => convertRawTokenInfoIntoSPLToken(wSolToSolToken(poolInfo.rawPool.mintB as TokenInfo)),
    [poolInfo.rawPool.mintB],
  )

  const { amount0, amount1 } = useLiquidityAmount({
    poolInfo: poolInfo.rawPool,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
  })

  const { totalUsdValue } = useLiquidityUsdValue({
    poolInfo: poolInfo.rawPool,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
  })

  const { ratio0, ratio1 } = useLiquidityDepositRatio({
    poolInfo: poolInfo.rawPool,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: new BN(10000),
  })

  const { breakdownRewardInfo, totalPendingYield } = useSolanaV3RewardInfoFromSimulation({
    poolInfo,
    position,
  })

  const totalValueDisplay = useMemo(() => {
    if (!totalUsdValue) return '$0.0000'
    const value = totalUsdValue.toNumber()
    return formatFiatNumber(value)
  }, [totalUsdValue])

  const totalEarningsDisplay = useMemo(() => {
    if (!totalPendingYield) return '$0.0000'
    const value = totalPendingYield.toNumber()
    return formatFiatNumber(value)
  }, [totalPendingYield])

  const ratio0Display = useMemo(() => {
    if (!ratio0) return '0.00%'
    return `${formatPercent(ratio0, 2)}%`
  }, [ratio0])

  const ratio1Display = useMemo(() => {
    if (!ratio1) return '0.00%'
    return `${formatPercent(ratio1, 2)}%`
  }, [ratio1])

  const lpFeesData = useMemo(() => {
    const fees: Array<{
      token: any
      amount: string
      usdValue: string
    }> = []
    if (breakdownRewardInfo.fee.A && Number(breakdownRewardInfo.fee.A.amount) > 0) {
      fees.push({
        token: convertRawTokenInfoIntoSPLToken(breakdownRewardInfo.fee.A.mint as TokenInfo),
        amount: formatNumber(Number(breakdownRewardInfo.fee.A.amount)),
        usdValue: `~$${breakdownRewardInfo.fee.A.amountUSD}`,
      })
    }
    if (breakdownRewardInfo.fee.B && Number(breakdownRewardInfo.fee.B.amount) > 0) {
      fees.push({
        token: convertRawTokenInfoIntoSPLToken(breakdownRewardInfo.fee.B.mint as TokenInfo),
        amount: formatNumber(Number(breakdownRewardInfo.fee.B.amount)),
        usdValue: `~$${breakdownRewardInfo.fee.B.amountUSD}`,
      })
    }
    return fees
  }, [breakdownRewardInfo.fee])

  const farmRewardsData = useMemo(() => {
    return breakdownRewardInfo.rewards
      .filter((r) => Number(r.amount) > 0)
      .map((r) => ({
        token: convertRawTokenInfoIntoSPLToken(r.mint as TokenInfo),
        amount: formatNumber(Number(r.amount)),
        usdValue: `~$${r.amountUSD}`,
      }))
  }, [breakdownRewardInfo.rewards])

  return (
    <Card {...props}>
      <CardBody>
        <AutoColumn gap="16px">
          <div>
            <PreTitle textTransform="uppercase" color="textSubtle" mb="8px">
              {t('POSITION')}
            </PreTitle>
            <Text fontSize="24px" bold mb="16px">
              {totalValueDisplay}
            </Text>

            <Flex justifyContent="space-between" mb="8px">
              <TokenRow>
                <TokenLogo
                  srcs={getCurrencyLogoSrcs(currency0)}
                  sizes="xs"
                  width={24}
                  height={24}
                  style={{ borderRadius: '50%' }}
                />
                <Text fontSize="14px" color="textSubtle">
                  {currency0?.symbol}
                </Text>
              </TokenRow>

              <TokenRow>
                <Text fontSize="14px" color="textSubtle">
                  {currency1?.symbol}
                </Text>
                <TokenLogo
                  srcs={getCurrencyLogoSrcs(currency1)}
                  sizes="xs"
                  width={24}
                  height={24}
                  style={{ borderRadius: '50%' }}
                />
              </TokenRow>
            </Flex>

            <Flex justifyContent="space-between" mb="8px">
              <Text fontSize="16px">{formatNumber(amount0?.toExact() ?? 0)}</Text>
              <Text fontSize="16px">{formatNumber(amount1?.toExact() ?? 0)}</Text>
            </Flex>
            <BalanceBar ratio={ratio0 ? Number(formatPercent(ratio0, 2)) : 0} />

            <Flex justifyContent="space-between" mb="8px">
              <Text fontSize="12px">{ratio0Display}</Text>
              <Text fontSize="12px">{ratio1Display}</Text>
            </Flex>

            <RowBetween>
              <Text fontSize="14px" color="textSubtle">
                {t('Deposit Ratio')}:
              </Text>
              <Text fontSize="14px">
                {formatPercent(ratio0, 2)}% {currency0?.symbol} / {formatPercent(ratio1, 2)}% {currency1?.symbol}
              </Text>
            </RowBetween>
          </div>

          <Divider />

          <EarningsSection>
            <PreTitle textTransform="uppercase" color="textSubtle" mb="8px">
              {t('EARNINGS')}
            </PreTitle>
            <Text fontSize="24px" bold mb="16px">
              {totalEarningsDisplay}
            </Text>

            {lpFeesData.length > 0 && (
              <div>
                <Text fontSize="16px" bold mb="8px">
                  {t('LP Fees')}
                </Text>
                <EarningsTokenList>
                  {lpFeesData.map((item, index) => (
                    <EarningsTokenItem key={`lp-fee-${index}`}>
                      <FlexGap alignItems="center" gap="8px">
                        <TokenLogo
                          srcs={getCurrencyLogoSrcs(item.token)}
                          sizes="xs"
                          width={24}
                          height={24}
                          style={{ borderRadius: '50%' }}
                        />
                        <Text fontSize="14px" color="textSubtle">
                          {item.token?.symbol}
                        </Text>
                      </FlexGap>
                      <div>
                        <Text fontSize="16px">{item.amount}</Text>
                        <Text fontSize="12px" color="textSubtle">
                          {item.usdValue}
                        </Text>
                      </div>
                    </EarningsTokenItem>
                  ))}
                </EarningsTokenList>
              </div>
            )}

            {farmRewardsData.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Text fontSize="16px" bold mb="8px">
                  {t('Farm Rewards')}
                </Text>
                <EarningsTokenList>
                  {farmRewardsData.map((item, index) => (
                    <EarningsTokenItem key={`farm-reward-${index}`}>
                      <FlexGap alignItems="center" gap="8px">
                        <TokenLogo
                          srcs={getCurrencyLogoSrcs(item.token)}
                          sizes="xs"
                          width={24}
                          height={24}
                          style={{ borderRadius: '50%' }}
                        />
                        <Text fontSize="14px" color="textSubtle">
                          {item.token?.symbol}
                        </Text>
                      </FlexGap>
                      <div>
                        <Text fontSize="16px">{item.amount}</Text>
                        <Text fontSize="12px" color="textSubtle">
                          {item.usdValue}
                        </Text>
                      </div>
                    </EarningsTokenItem>
                  ))}
                </EarningsTokenList>
              </div>
            )}
          </EarningsSection>
          {isOwner ? (
            <SolanaV3PositionActions
              detailMode
              removed={position.liquidity.isZero()}
              poolInfo={poolInfo}
              position={position}
            />
          ) : null}
        </AutoColumn>
      </CardBody>
    </Card>
  )
}
