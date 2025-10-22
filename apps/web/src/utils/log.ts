import { Currency, TradeType, UnifiedCurrency } from '@pancakeswap/swap-sdk-core'

import { logger } from './datadog'

export const logTx = ({ account, hash, chainId }: { account: string; hash: string; chainId: number }) => {
  fetch(`/api/_log/${account}/${chainId}/${hash}`)
}

export type LogTradeType =
  | 'V2Swap'
  | 'SmartSwap'
  | 'StableSwap'
  | 'MarketMakerSwap'
  | 'V3SmartSwap'
  | 'UniversalRouter'
  | 'X'
  | 'X-Filled'
  | 'SolanaSwap'

export const logSwap = ({
  input,
  output,
  inputAmount,
  outputAmount,
  chainId,
  account,
  hash,
  type,
  tradeType,
}: {
  tradeType?: TradeType
  input: UnifiedCurrency
  output: UnifiedCurrency
  inputAmount?: string
  outputAmount?: string
  chainId: number
  account: string
  hash: `0x${string}`
  type: LogTradeType
}) => {
  try {
    logger.info(type, {
      tradeType,
      inputAddress: input.isToken ? input.address.toLowerCase() : input.symbol,
      outputAddress: output.isToken ? output.address.toLowerCase() : output.symbol,
      inputAmount,
      outputAmount,
      account,
      hash,
      chainId,
    })
  } catch (error) {
    //
  }
}
