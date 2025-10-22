import { useSolanaUserSlippage } from '@pancakeswap/utils/user'
import { useMemo } from 'react'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { PoolUtils, TokenInfo } from '@pancakeswap/solana-core-sdk'
import { SolanaV3Pool } from 'state/pools/solana'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useSolanaEpochInfo } from './useSolanaEpochInfo'
import { useSolanaConnectionWithRpcAtom } from './useSolanaConnectionWithRpcAtom'

export type UseAddLiquidityAmountProps = {
  poolInfo: SolanaV3Pool
  tickLower: number
  tickUpper: number
  side: 0 | 1 | null
  amount: string
}

export const useAddLiquidityAmount = ({ poolInfo, tickLower, tickUpper, side, amount }: UseAddLiquidityAmountProps) => {
  const connection = useSolanaConnectionWithRpcAtom()
  const { data: epochInfo } = useSolanaEpochInfo()
  const [slippage] = useSolanaUserSlippage()
  const currency0 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintA as TokenInfo), [poolInfo?.mintA])
  const currency1 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintB as TokenInfo), [poolInfo?.mintB])

  return useMemo(() => {
    if (!poolInfo || !connection || !epochInfo || side === null || !amount)
      return {
        amount0: undefined,
        amountSlippage0: undefined,
        amount1: undefined,
        amountSlippage1: undefined,
        liquidity: undefined,
      }

    const { amountA, amountSlippageA, amountB, amountSlippageB, liquidity } =
      PoolUtils.getLiquidityAmountOutFromAmountIn({
        poolInfo,
        slippage: 0,
        inputA: side === 0,
        tickUpper: Math.max(tickLower, tickUpper),
        tickLower: Math.min(tickLower, tickUpper),
        amount: new BN(
          new BigNumber(amount).multipliedBy(10 ** (side === 0 ? currency0.decimals : currency1.decimals)).toFixed(0),
        ),
        add: true,
        amountHasFee: true,
        epochInfo,
      })

    return {
      amount0: UnifiedCurrencyAmount.fromRawAmount(currency0, amountA.amount.toString()),
      amountSlippage0: UnifiedCurrencyAmount.fromRawAmount(currency0, amountSlippageA.amount.toString())
        .multiply(10000 + slippage)
        .divide(10000),
      amount1: UnifiedCurrencyAmount.fromRawAmount(currency1, amountB.amount.toString()),
      amountSlippage1: UnifiedCurrencyAmount.fromRawAmount(currency1, amountSlippageB.amount.toString())
        .multiply(10000 + slippage)
        .divide(10000),
      liquidity,
    }
  }, [poolInfo, tickLower, tickUpper, side, amount, slippage, currency0, currency1])
}
