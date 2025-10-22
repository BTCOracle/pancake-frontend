import { Box, Breadcrumbs, Container, FlexGap, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { Pair } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/v3-sdk'
import React, { useMemo } from 'react'
import { useV3FarmAPI } from 'hooks/useV3FarmAPI'
import { atom, useAtom } from 'jotai'
import { styled } from 'styled-components'

import { useTranslation } from '@pancakeswap/localization'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useQuery } from '@tanstack/react-query'
import { useFeeTierDistribution } from 'hooks/v3/useFeeTierDistribution'
import { getPoolDetailPageLink } from 'utils/getPoolLink'
import { useCurrency } from 'hooks/Tokens'
import useStableConfig from 'views/Swap/hooks/useStableConfig'
import { PoolInfo } from 'state/farmsV4/state/type'
import useV3DerivedInfo from 'hooks/v3/useV3DerivedInfo'
import { PoolInfoHeader } from 'components/PoolInfoHeader'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolInfo } from 'state/farmsV4/state/extendPools/hooks'

import { useCurrencyParams } from '../hooks/useCurrencyParams'
import { SELECTOR_TYPE } from '../types'
import { AprCalculatorV2 } from './AprCalculatorV2'
import { useHeaderInvertCurrencies } from '../hooks/useHeaderInvertCurrencies'

const LinkText = styled(Text)`
  color: ${({ theme }) => theme.colors.primary60};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`
export const selectTypeAtom = atom(SELECTOR_TYPE.V3)

export function AddEVMLiquidityV3Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const { isMobile } = useMatchBreakpoints()

  const [selectType] = useAtom(selectTypeAtom)
  const { currencyIdA, currencyIdB, feeAmount } = useCurrencyParams()

  const baseCurrency = useCurrency(currencyIdA)
  const quoteCurrency = useCurrency(currencyIdB)

  const stableConfig = useStableConfig({
    tokenA: baseCurrency,
    tokenB: quoteCurrency,
  })

  // V3 Pool Farm Config
  const { farms: farmV3Config } = useV3FarmAPI(chainId)

  const farmV3 = useMemo(() => {
    if (baseCurrency && quoteCurrency) {
      const [tokenA, tokenB] = [baseCurrency.wrapped, quoteCurrency.wrapped]
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return farmV3Config?.find((f) => f.token.equals(token0) && f.quoteToken.equals(token1))
    }
    return null
  }, [baseCurrency, quoteCurrency, farmV3Config])

  // Fetch latest fee tier for V3 pool
  const { largestUsageFeeTier } = useFeeTierDistribution(baseCurrency, quoteCurrency)

  const poolAddress = useMemo(
    () =>
      baseCurrency?.wrapped && quoteCurrency?.wrapped
        ? selectType === SELECTOR_TYPE.V3
          ? feeAmount
            ? Pool.getAddress(baseCurrency.wrapped, quoteCurrency.wrapped, feeAmount)
            : farmV3
            ? Pool.getAddress(baseCurrency.wrapped, quoteCurrency.wrapped, farmV3.feeAmount)
            : largestUsageFeeTier
            ? Pool.getAddress(baseCurrency.wrapped, quoteCurrency.wrapped, largestUsageFeeTier)
            : undefined
          : selectType === SELECTOR_TYPE.V2
          ? Pair.getAddress(baseCurrency.wrapped, quoteCurrency.wrapped)
          : selectType === SELECTOR_TYPE.STABLE
          ? stableConfig.stableSwapConfig?.stableSwapAddress
          : undefined
        : undefined,
    [
      baseCurrency?.wrapped,
      feeAmount,
      quoteCurrency?.wrapped,
      selectType,
      stableConfig.stableSwapConfig,
      largestUsageFeeTier,
      farmV3,
    ],
  )

  const pool = usePoolInfo({ poolAddress, chainId })

  const inverted = useMemo(
    () =>
      Boolean(
        pool?.token0 &&
          pool?.token1 &&
          pool?.token0?.wrapped.address !== pool?.token1?.wrapped.address &&
          pool?.token0?.wrapped.address !== baseCurrency?.wrapped.address,
      ),
    [pool, baseCurrency],
  )

  const { handleInvertCurrencies } = useHeaderInvertCurrencies({ currencyIdA, currencyIdB, feeAmount })

  const { data: poolDetailLink } = useQuery({
    queryKey: ['poolDetailLink', chainId, pool],
    queryFn: () => {
      if (chainId && pool) {
        return getPoolDetailPageLink(pool)
      }
      return null
    },
    enabled: !!chainId && !!pool,
  })

  const currencyA = pool?.token0 ?? baseCurrency ?? undefined
  const currencyB = pool?.token1 ?? quoteCurrency ?? undefined

  // Fallback for fetching pool price in new V3 pools with no trades.
  // With no trades, BE doesn't index the pool so we do not get token0Price and token1Price in the pool object.
  const isTokenPriceAvailable = useMemo(
    () => Number(pool?.token0Price) && Number(pool?.token1Price),
    [pool?.token0Price, pool?.token1Price],
  )
  const { price: v3Price } = useV3DerivedInfo(
    !isTokenPriceAvailable ? currencyA : undefined,
    !isTokenPriceAvailable ? currencyB : undefined,
    feeAmount,
    baseCurrency ?? undefined,
  )

  const poolInfo: PoolInfo | null = useMemo(() => {
    if (!pool) return null
    return {
      ...pool,
      ...(!isTokenPriceAvailable && {
        token0Price: v3Price?.invert().toSignificant(6) as `${number}`,
        token1Price: v3Price?.toSignificant(6) as `${number}`,
      }),
    }
  }, [pool, isTokenPriceAvailable, v3Price])

  return (
    <Container mx="auto" my="24px" maxWidth="1200px">
      <Box mb="24px">
        <Breadcrumbs>
          <NextLinkFromReactRouter to="/liquidity/pools">
            <LinkText>{t('Farms')}</LinkText>
          </NextLinkFromReactRouter>
          {chainId && pool && poolDetailLink && (
            <NextLinkFromReactRouter to={poolDetailLink}>
              <LinkText>{t('Pool Detail')}</LinkText>
            </NextLinkFromReactRouter>
          )}
          <FlexGap alignItems="center" gap="4px">
            <Text>{t('Add Liquidity')}</Text>
          </FlexGap>
        </Breadcrumbs>
      </Box>
      <PoolInfoHeader
        linkType="addLiquidity"
        poolInfo={poolInfo}
        chainId={chainId}
        currency0={currencyA}
        currency1={currencyB}
        isInverted={inverted}
        onInvertPrices={handleInvertCurrencies}
        poolId={poolAddress}
        overrideAprDisplay={
          selectType === SELECTOR_TYPE.V3
            ? {
                aprDisplay: (
                  <AprCalculatorV2
                    pool={pool}
                    inverted={inverted}
                    showTitle={false}
                    derived
                    showApyButton={false}
                    fontSize={isMobile ? '20px' : '24px'}
                  />
                ),
                roiCalculator: (
                  <AprCalculatorV2
                    pool={pool}
                    inverted={inverted}
                    showTitle={false}
                    derived
                    showApyText={false}
                    fontSize={isMobile ? '20px' : '24px'}
                  />
                ),
              }
            : undefined
        }
      />
      {children}
    </Container>
  )
}
