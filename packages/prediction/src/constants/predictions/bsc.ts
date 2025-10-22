import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, Native } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import {
  chainlinkOracleBNB,
  chainlinkOracleCAKE,
  chainlinkOracleETH,
  chainlinkOracleWBTC,
} from '../../chainlinkOracleContract'
import {
  GRAPH_API_PREDICTION_BNB,
  GRAPH_API_PREDICTION_CAKE,
  GRAPH_API_PREDICTION_ETH,
  GRAPH_API_PREDICTION_WBTC,
} from '../../endpoints'
import { predictionsBNB, predictionsCAKE, predictionsETH, predictionsWBTC } from '../../predictionContract'
import { PredictionConfig, PredictionContractVersion, PredictionSupportedSymbol } from '../../type'

const BTC = new ERC20Token(bscTokens.wBTC.chainId, bscTokens.wBTC.address, bscTokens.wBTC.decimals, 'BTC', 'Bitcoin')

// @ts-ignore
BTC.logoURI = 'https://tokens.pancakeswap.finance/images/symbol/wbtc.png'

export const predictions: Record<string, PredictionConfig> = {
  [PredictionSupportedSymbol.BNB]: {
    version: PredictionContractVersion.V2,

    betCurrency: Native.onChain(ChainId.BSC),
    predictionCurrency: Native.onChain(ChainId.BSC),

    address: predictionsBNB[ChainId.BSC],
    api: GRAPH_API_PREDICTION_BNB[ChainId.BSC],
    chainlinkOracleAddress: chainlinkOracleBNB[ChainId.BSC],

    displayedDecimals: 4,
    tokenBackgroundColor: '#F0B90B',
  },
  [PredictionSupportedSymbol.ETH]: {
    version: PredictionContractVersion.V2_1,

    betCurrency: Native.onChain(ChainId.BSC),
    predictionCurrency: bscTokens.eth,

    address: predictionsETH[ChainId.BSC],
    api: GRAPH_API_PREDICTION_ETH[ChainId.BSC],
    chainlinkOracleAddress: chainlinkOracleETH[ChainId.BSC],

    displayedDecimals: 2,
    balanceDecimals: 4,
  },
  [PredictionSupportedSymbol.BTC]: {
    version: PredictionContractVersion.V2_1,

    betCurrency: Native.onChain(ChainId.BSC),
    predictionCurrency: BTC,

    address: predictionsWBTC[ChainId.BSC],
    api: GRAPH_API_PREDICTION_WBTC[ChainId.BSC],
    chainlinkOracleAddress: chainlinkOracleWBTC[ChainId.BSC],

    displayedDecimals: 2,
    balanceDecimals: 4,
  },
  [PredictionSupportedSymbol.CAKE]: {
    paused: true,
    version: PredictionContractVersion.V3,

    betCurrency: bscTokens.cake,
    predictionCurrency: bscTokens.cake,

    address: predictionsCAKE[ChainId.BSC],
    api: GRAPH_API_PREDICTION_CAKE[ChainId.BSC],
    chainlinkOracleAddress: chainlinkOracleCAKE[ChainId.BSC],

    displayedDecimals: 4,
    tokenBackgroundColor: '#25C7D6',
  },
}
