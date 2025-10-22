import { Suspense } from 'react'
import { Flex, Spinner } from '@pancakeswap/uikit'
import TradingViewChart from 'components/TradingView'
import { useConfig } from '../context/ConfigProvider'

const TRADING_VIEW_COMPONENT_ID = 'tradingview_b239c'

const TradingView = () => {
  const config = useConfig()
  return (
    <Suspense
      fallback={
        <Flex
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spinner />
        </Flex>
      }
    >
      <TradingViewChart id={TRADING_VIEW_COMPONENT_ID} symbol={`BINANCE:${config?.predictionCurrency.symbol}USD`} />
    </Suspense>
  )
}

export default TradingView
