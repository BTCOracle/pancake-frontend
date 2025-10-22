import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { Flex, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/Logo'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useMemo } from 'react'
import styled from 'styled-components'
import { formatAmount } from 'utils/formatInfoNumbers'
import { formatPoolDetailFiatNumber } from 'views/PoolDetail/utils'

const TooltipCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 16px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  z-index: 10;
`

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`

interface CustomToolTipProps {
  currency0?: Currency
  currency1?: Currency
  price0?: `${number}`
  price1?: `${number}`
  tvlToken0?: number
  tvlToken1?: number
  currentPrice: number | undefined
  activeLiquidity?: number
  isCurrent?: boolean
}

export const ChartToolTip: React.FC<CustomToolTipProps> = ({
  price0,
  price1,
  tvlToken0,
  tvlToken1,
  currentPrice,
  currency0,
  currency1,
}) => {
  const { t } = useTranslation()
  const symbol0 = currency0?.symbol || 'TOKEN1'
  const symbol1 = currency1?.symbol || 'TOKEN2'

  const { data: token0Price } = useCurrencyUsdPrice(currency0)
  const { data: token1Price } = useCurrencyUsdPrice(currency1)

  const totalLiquidityUSD = useMemo(() => {
    if (!token0Price || !token1Price) return 0

    if (currentPrice && price0 && currentPrice > Number(price1)) {
      return token0Price * (tvlToken0 || 0)
    }

    return token1Price * (tvlToken1 || 0)
  }, [currentPrice, price0, price1, token0Price, token1Price, tvlToken0, tvlToken1])

  // Safely convert currentPrice to number and handle edge cases
  const getDisplayPrice = () => {
    if (currentPrice && typeof currentPrice === 'number' && !Number.isNaN(currentPrice)) {
      return formatAmount(currentPrice, { precision: 6 })
    }
    if (price0) {
      const numPrice = Number(price0)
      return !Number.isNaN(numPrice) ? formatAmount(numPrice, { precision: 6 }) : '0'
    }
    return '0'
  }

  return (
    <TooltipCard>
      <TooltipRow>
        <Text color="textSubtle">{t('Price')}</Text>
        <Text>
          {getDisplayPrice()} {symbol1} per {symbol0}
        </Text>
      </TooltipRow>

      <TooltipRow>
        <Text color="textSubtle">{t('Liquidity')}</Text>
        <Text>{formatPoolDetailFiatNumber(totalLiquidityUSD)}</Text>
      </TooltipRow>

      {currentPrice && price0 && currentPrice > Number(price1) ? (
        <TooltipRow>
          <Flex alignItems="center">
            <CurrencyLogo currency={currency0} size="20px" style={{ marginRight: '8px' }} />
            <Text>
              {symbol0} {t('Locked')}
            </Text>
          </Flex>
          <Text bold>{formatAmount(tvlToken0)}</Text>
        </TooltipRow>
      ) : (
        <TooltipRow>
          <Flex alignItems="center">
            <CurrencyLogo currency={currency1} size="20px" style={{ marginRight: '8px' }} />
            <Text>
              {symbol1} {t('Locked')}
            </Text>
          </Flex>
          <Text bold>{formatAmount(tvlToken1)}</Text>
        </TooltipRow>
      )}
    </TooltipCard>
  )
}
