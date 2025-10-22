import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/prediction'
import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import Predictions from '../../views/Predictions'
import PredictionConfigProviders from '../../views/Predictions/context/PredictionConfigProviders'

function Prediction() {
  return <Predictions />
}

const PredictionPage = dynamic(() => Promise.resolve(Prediction), {
  ssr: false,
}) as NextPageWithLayout

PredictionPage.Layout = PredictionConfigProviders
PredictionPage.chains = [...SUPPORTED_CHAIN_IDS]
PredictionPage.screen = true

export default PredictionPage
