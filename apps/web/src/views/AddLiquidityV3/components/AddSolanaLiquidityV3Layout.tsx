import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import { Box, Breadcrumbs, Container, FlexGap, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { useTranslation } from '@pancakeswap/localization'
import { useUnifiedCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useAccountActiveChain'
import { useSolanaPoolByMint } from 'hooks/solana/useSolanaPoolsByMint'
import { PoolInfoHeader } from 'components/PoolInfoHeader'
import { SolanaPoolDerivedAprText } from 'views/universalFarms/components/SolanaPoolDerivedAprButton'
import { getPoolDetailPageLink } from 'utils/getPoolLink'

import { useSolanaOnchainClmmPool } from 'hooks/solana/useSolanaOnchainPool'
import { useCurrencyParams } from '../hooks/useCurrencyParams'
import { useHeaderInvertCurrencies } from '../hooks/useHeaderInvertCurrencies'

const LinkText = styled(Text)`
  color: ${({ theme }) => theme.colors.primary60};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`

export function AddSolanaLiquidityV3Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const { isMobile } = useMatchBreakpoints()
  const { currencyIdA, currencyIdB, feeAmount } = useCurrencyParams()

  const baseCurrency = useUnifiedCurrency(currencyIdA)
  const quoteCurrency = useUnifiedCurrency(currencyIdB)
  const { data: poolInfo } = useSolanaPoolByMint(
    baseCurrency?.wrapped.address,
    quoteCurrency?.wrapped.address,
    feeAmount,
  )
  const { data: poolOnChain } = useSolanaOnchainClmmPool(poolInfo?.poolId)

  const inverted = useMemo(
    () =>
      Boolean(
        poolInfo?.token0 &&
          poolInfo?.token1 &&
          poolInfo?.token0.wrapped.address !== poolInfo?.token1.wrapped.address &&
          baseCurrency &&
          !poolInfo.token0.wrapped.equals(baseCurrency),
      ),
    [poolInfo, baseCurrency],
  )

  const { handleInvertCurrencies } = useHeaderInvertCurrencies({ currencyIdA, currencyIdB, feeAmount })

  const currencyA = poolInfo?.token0 ?? baseCurrency ?? undefined
  const currencyB = poolInfo?.token1 ?? quoteCurrency ?? undefined

  const { data: detailPageLink } = useQuery({
    queryKey: ['poolDetailLink', chainId, poolInfo],
    queryFn: () => {
      if (chainId && poolInfo) {
        return getPoolDetailPageLink(poolInfo)
      }
      return null
    },
    enabled: !!chainId && !!poolInfo,
  })

  return (
    <Container mx="auto" my="24px" maxWidth="1200px">
      <Box mb="24px">
        <Breadcrumbs>
          <NextLinkFromReactRouter to="/liquidity/pools">
            <LinkText>{t('Farms')}</LinkText>
          </NextLinkFromReactRouter>
          {chainId && poolInfo && detailPageLink && (
            <NextLinkFromReactRouter to={detailPageLink}>
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
        poolId={poolInfo?.poolId}
        price={poolOnChain?.computePoolInfo.currentPrice}
        overrideAprDisplay={{
          aprDisplay: poolInfo ? (
            <SolanaPoolDerivedAprText pool={poolInfo} fontSize={isMobile ? '20px' : '24px'} />
          ) : (
            <></>
          ),
          roiCalculator: <></>,
        }}
      />
      {children}
    </Container>
  )
}
