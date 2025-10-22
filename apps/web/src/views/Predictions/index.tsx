import { PredictionContractVersion, PredictionsChartView } from '@pancakeswap/prediction'
import { useMatchBreakpoints, useModal } from '@pancakeswap/uikit'
import { useAccountLocalEventListener } from 'hooks/useAccountLocalEventListener'
import { useEffect, useRef } from 'react'
import { useChartView, useIsChartPaneOpen } from 'state/predictions/hooks'
import { useUserPredictionChainlinkChartDisclaimerShow, useUserPredictionChartDisclaimerShow } from 'state/user/hooks'
import { useTranslation } from '@pancakeswap/localization'
import Desktop from './Desktop'
import Mobile from './Mobile'
import ChainlinkChartDisclaimer from './components/ChainlinkChartDisclaimer'
import ChartDisclaimer from './components/ChartDisclaimer'
import CollectWinningsPopup from './components/CollectWinningsPopup'
import Container from './components/Container'
import RiskDisclaimer from './components/RiskDisclaimer'
import SmartWalletWarning from '../../components/SmartWalletWarning'
import { useConfig } from './context/ConfigProvider'
import SwiperProvider from './context/SwiperProvider'
import usePollPredictions from './hooks/usePollPredictions'

function Warnings() {
  const [showDisclaimer] = useUserPredictionChartDisclaimerShow()
  const [showChainlinkDisclaimer] = useUserPredictionChainlinkChartDisclaimerShow()
  const isChartPaneOpen = useIsChartPaneOpen()
  const chartView = useChartView()
  const config = useConfig()

  const [onPresentChartDisclaimer] = useModal(<ChartDisclaimer />, false)
  const [onPresentChainlinkChartDisclaimer] = useModal(<ChainlinkChartDisclaimer />, false)

  // TODO: memoize modal's handlers
  const onPresentChartDisclaimerRef = useRef(onPresentChartDisclaimer)
  const onPresentChainlinkChartDisclaimerRef = useRef(onPresentChainlinkChartDisclaimer)

  // Chart Disclaimer
  useEffect(() => {
    if (isChartPaneOpen && showDisclaimer && chartView === PredictionsChartView.TradingView) {
      onPresentChartDisclaimerRef.current()
    }
  }, [onPresentChartDisclaimerRef, isChartPaneOpen, showDisclaimer, chartView])

  // Chainlink Disclaimer
  useEffect(() => {
    if (
      isChartPaneOpen &&
      showChainlinkDisclaimer &&
      chartView === PredictionsChartView.Chainlink &&
      config?.chainlinkOracleAddress
    ) {
      onPresentChainlinkChartDisclaimerRef.current()
    }
  }, [
    onPresentChainlinkChartDisclaimerRef,
    isChartPaneOpen,
    showChainlinkDisclaimer,
    chartView,
    config?.chainlinkOracleAddress,
  ])

  return null
}

const Predictions = () => {
  const config = useConfig()

  const { t } = useTranslation()
  const { isDesktop } = useMatchBreakpoints()

  const isChartPaneOpen = useIsChartPaneOpen()

  // New v2.1 contracts support smart wallets
  const isSmartWalletSupported = config && config.version === PredictionContractVersion.V2_1

  useAccountLocalEventListener()

  usePollPredictions()

  return (
    <SwiperProvider>
      {!isSmartWalletSupported && <SmartWalletWarning productName={t('Prediction')} />}
      <Container $isChartPaneOpen={isChartPaneOpen}>
        <Warnings />

        <RiskDisclaimer />
        {isDesktop ? <Desktop /> : <Mobile />}
        <CollectWinningsPopup />
      </Container>
    </SwiperProvider>
  )
}

export default Predictions
