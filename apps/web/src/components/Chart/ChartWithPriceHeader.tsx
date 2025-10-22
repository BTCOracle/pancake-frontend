import { UnifiedCurrency } from '@pancakeswap/sdk'
import { Box } from '@pancakeswap/uikit'
import { useSetAtom } from 'jotai'
import React, { useCallback, useState } from 'react'
import { styled } from 'styled-components'
import { chartPriceDataAtom } from './atom/chartPriceDataAtom'
import PriceHeader from './PriceHeader'
import TradingViewChart from './TradingViewChart'

interface ChartWithPriceHeaderProps {
  symbol?: string
  currency0?: UnifiedCurrency
  currency1?: UnifiedCurrency
  theme?: 'Light' | 'Dark'
}

const Container = styled(Box)`
  width: 100%;
  height: 100%;
  border-radius: 16px 16px 0 0;
  background: ${({ theme }) => theme.card.background};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
  padding-top: 24px;
  ${({ theme }) => theme.mediaQueries.md} {
    height: fit-content;
    padding-top: 0;
    border-radius: 16px;
  }
`

const ChartWithPriceHeader: React.FC<ChartWithPriceHeaderProps> = ({
  symbol = 'CAKE/BNB',
  currency0,
  currency1,
  theme = 'Dark',
}) => {
  const [isReversed, setIsReversed] = useState(false)
  const setPriceData = useSetAtom(chartPriceDataAtom)

  const on24HPriceDataChange = useCallback(
    (h: number, l: number, c: number, changes: number) => {
      setPriceData({
        price: c,
        priceChangePercent: changes,
        high24h: h,
        low24h: l,
      })
    },
    [setPriceData],
  )
  const onLiveDataChanges = useCallback((c: number) => {
    console.log('c', c)
  }, [])

  return (
    <Container>
      <PriceHeader
        symbol={symbol}
        currency0={currency0}
        currency1={currency1}
        isReversed={isReversed}
        setIsReversed={setIsReversed}
      />
      <TradingViewChart
        theme={theme}
        currency0={isReversed ? currency1 : currency0}
        currency1={isReversed ? currency0 : currency1}
        on24HPriceDataChange={on24HPriceDataChange}
        // @ts-ignore
        onLiveDataChanges={onLiveDataChanges}
      />
    </Container>
  )
}

export default ChartWithPriceHeader
