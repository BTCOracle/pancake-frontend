import { Protocol } from '@pancakeswap/farms'
import PageLoader from 'components/Loader/PageLoader'
import { useInfinityBinPositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { useHookByPoolId } from 'hooks/infinity/useHooksList'
import { usePoolById } from 'hooks/infinity/usePool'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { NextSeo } from 'next-seo'

import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, Fraction } from '@pancakeswap/swap-sdk-core'
import {
  AutoRow,
  Box,
  Breadcrumbs,
  Card,
  CardBody,
  Container,
  Flex,
  FlexGap,
  Link,
  QuestionHelper,
  RowBetween,
  Text,
} from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { LightGreyCard } from 'components/Card'
import { CurrencyLogo } from 'components/Logo'
import { MerklSection } from 'components/Merkl/MerklSection'
import { useInfinityBinPosition } from 'hooks/infinity/useInfinityPositions'
import { usePositionIsFarming } from 'hooks/infinity/useIsFarming'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { useMemo } from 'react'
import { usePoolInfo } from 'state/farmsV4/hooks'
import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import type { InfinityBinPoolInfo } from 'state/farmsV4/state/type'
import { InfinityBinPoolPositionAprButton, formatPositionAmount } from 'views/universalFarms/components'
import { useAccount } from 'wagmi'

import { BinPositionPriceSection } from './components/BinPositionPrice'
import { PositionHeader } from './components/PositionHeader'

export const InfinityBinPosition = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { poolId } = useInfinityBinPositionIdRouteParams()
  const { chainId } = useActiveChainId()
  const [, binPool] = usePoolById<'Bin'>(poolId, chainId)
  const poolInfo = usePoolInfo<InfinityBinPoolInfo>({ poolAddress: poolId, chainId })
  const hookData = useHookByPoolId(chainId, poolId)
  const isFarming = usePositionIsFarming({ chainId, poolId })

  const [currency0, currency1] = useMemo(() => {
    if (!binPool) return [undefined, undefined]
    return [binPool.token0, binPool.token1]
  }, [binPool])

  const { data: position } = useInfinityBinPosition(poolId, chainId, account)
  const reserve0 = useMemo(
    () => (currency0 ? CurrencyAmount.fromRawAmount(currency0, position?.reserveX ?? 0n) : undefined),
    [currency0, position],
  )
  const reserve1 = useMemo(
    () => (currency1 ? CurrencyAmount.fromRawAmount(currency1, position?.reserveY ?? 0n) : undefined),
    [currency1, position],
  )

  const price0 = useStablecoinPrice(currency0, { enabled: Boolean(reserve0?.greaterThan(0)) })
  const price1 = useStablecoinPrice(currency1, { enabled: Boolean(reserve1?.greaterThan(0)) })

  const fiatValueOfLiquidity = useMemo(() => {
    if (!reserve0 && !reserve1) return undefined

    const amount0 = price0 && reserve0 ? price0.quote(reserve0) : undefined
    const amount1 = price1 && reserve1 ? price1.quote(reserve1) : undefined

    if (amount0 && amount1) return amount0.add(amount1)
    if (amount0) return amount0
    if (amount1) return amount1

    return undefined
  }, [price0, price1, reserve0, reserve1])

  const isRemoved = useMemo(() => {
    return reserve0?.equalTo(0) && reserve1?.equalTo(0)
  }, [reserve0, reserve1])

  // if (!binPool || !position) {
  if (!binPool) {
    return <PageLoader />
  }

  return (
    <>
      <NextSeo title={`${binPool?.token0?.symbol}-${binPool?.token1?.symbol} Infinity LP #${poolId}`} />

      <Container width={['100%', '100%', '100%', '80rem']}>
        {currency0 && currency1 ? (
          <Box my={['18px', '26px', '26px', '42px']}>
            <Breadcrumbs>
              <Link href="/liquidity/pools">{t('Farm')}</Link>
              <Text>{`${currency0?.symbol} / ${currency1?.symbol}`}</Text>
            </Breadcrumbs>
          </Box>
        ) : null}
        <Card style={{ maxWidth: '800px' }} mx="auto">
          <PositionHeader
            isFarming={isFarming && !isRemoved}
            isRemoved={isRemoved}
            protocol={Protocol.InfinityBIN}
            poolId={poolId}
            currency0={binPool?.token0}
            currency1={binPool?.token1}
            chainId={chainId}
            feeTier={binPool?.fee}
            dynamic={binPool?.dynamic}
            hookData={hookData}
            isOutOfRange={position?.status === POSITION_STATUS.INACTIVE}
          />
          <CardBody>
            <AutoRow>
              <Flex
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                mb="8px"
                style={{ gap: '16px' }}
                flexWrap={['wrap', 'wrap', 'nowrap']}
              >
                <Box width="100%" mb={['8px', '8px', 0]} position="relative">
                  {poolInfo && position && (
                    <Flex position="absolute" right={0}>
                      <InfinityBinPoolPositionAprButton pool={poolInfo} userPosition={position} />
                    </Flex>
                  )}
                  <FlexGap gap="4px" alignItems="center">
                    <Text fontSize="12px" color="secondary" bold textTransform="uppercase">
                      {t('Liquidity')}
                    </Text>
                    <QuestionHelper
                      color="secondary"
                      text={t(
                        'Displayed amounts include fees. In LBAMM pools, accrued fees are added back to the pool reserves.',
                      )}
                    />
                  </FlexGap>

                  <Text fontSize="24px" fontWeight={600} mb="8px">
                    $
                    {fiatValueOfLiquidity?.greaterThan(new Fraction(1, 100))
                      ? fiatValueOfLiquidity.toFixed(2, { groupSeparator: ',' })
                      : '-'}
                  </Text>
                  <LightGreyCard
                    mr="4px"
                    style={{
                      padding: '12px 16px',
                    }}
                  >
                    <AutoRow justifyContent="space-between" mb="8px">
                      <Flex>
                        <CurrencyLogo currency={currency0} />
                        <Text small color="textSubtle" id="remove-liquidity-tokenb-symbol" ml="4px">
                          {currency0?.symbol}
                        </Text>
                      </Flex>
                      <Flex justifyContent="center">
                        <Text small mr="4px">
                          {formatNumber(formatPositionAmount(reserve0))}
                        </Text>
                      </Flex>
                      <RowBetween justifyContent="flex-end">
                        <Text fontSize="10px" color="textSubtle" mr="4px">
                          {reserve0 && price0 ? `~$${price0.quote(reserve0).toFixed(2, { groupSeparator: ',' })}` : ''}
                        </Text>
                      </RowBetween>
                    </AutoRow>
                    <AutoRow justifyContent="space-between">
                      <Flex>
                        <CurrencyLogo currency={currency1} />
                        <Text small color="textSubtle" id="remove-liquidity-tokenb-symbol" ml="4px">
                          {currency1?.symbol}
                        </Text>
                      </Flex>
                      <Flex justifyContent="center">
                        <Text small mr="4px">
                          {formatNumber(formatPositionAmount(reserve1))}
                        </Text>
                      </Flex>
                      <RowBetween justifyContent="flex-end">
                        <Text fontSize="10px" color="textSubtle" mr="4px">
                          {reserve1 && !reserve1.equalTo(0) && price1
                            ? `~$${price1.quote(reserve1).toFixed(2, { groupSeparator: ',' })}`
                            : ''}
                        </Text>
                      </RowBetween>
                    </AutoRow>
                  </LightGreyCard>
                </Box>
              </Flex>
            </AutoRow>
            <Flex flexWrap={['wrap', 'wrap', 'wrap', 'nowrap']}>
              {position ? (
                <Box width="100%">
                  <BinPositionPriceSection
                    currency0={currency0}
                    currency1={currency1}
                    position={position}
                    activeId={binPool?.activeId}
                    price0={price0}
                    price1={price1}
                  />
                </Box>
              ) : null}

              <MerklSection
                disabled={!account || !position?.reserveX || !position?.reserveY}
                outRange={position?.status === POSITION_STATUS.INACTIVE}
                notEnoughLiquidity={Boolean(
                  fiatValueOfLiquidity
                    ? fiatValueOfLiquidity.lessThan(
                        // NOTE: if Liquidity is lessage 20$, can't participate in Merkl
                        new Fraction(
                          BigInt(20) * fiatValueOfLiquidity.decimalScale * fiatValueOfLiquidity.denominator,
                          fiatValueOfLiquidity?.denominator,
                        ),
                      )
                    : false,
                )}
                poolAddress={poolId}
                poolProtocol={Protocol.InfinityBIN}
              />
            </Flex>
          </CardBody>
        </Card>
      </Container>
    </>
  )
}
