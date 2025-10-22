import { ChainId } from '@pancakeswap/chains'
import { Native } from '@pancakeswap/sdk'
import { GRAPH_API_PREDICTION_ETH } from '../../endpoints'
import { galetoOracleETH } from '../../galetoOracleContract'
import { predictionsETH } from '../../predictionContract'
import { PredictionConfig, PredictionContractVersion, PredictionSupportedSymbol } from '../../type'

export const predictions: Record<string, PredictionConfig> = {
  [PredictionSupportedSymbol.ETH]: {
    paused: true,
    version: PredictionContractVersion.V2,

    betCurrency: Native.onChain(ChainId.ZKSYNC),
    predictionCurrency: Native.onChain(ChainId.ZKSYNC),

    address: predictionsETH[ChainId.ZKSYNC],
    api: GRAPH_API_PREDICTION_ETH[ChainId.ZKSYNC],
    galetoOracleAddress: galetoOracleETH[ChainId.ZKSYNC],
    displayedDecimals: 4,
    tokenBackgroundColor: '#647ceb',
  },
}
