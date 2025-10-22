import { useUnifiedCurrency } from 'hooks/Tokens'
import { NonEVMChainId } from '@pancakeswap/chains'
import { usePoolInfoByQuery } from './usePoolInfoByQuery'

export const usePoolCurrencies = () => {
  const poolInfo = usePoolInfoByQuery()

  const currency0 = poolInfo?.token0
  const currency1 = poolInfo?.token1

  const [poolSymbol, symbol0, symbol1] = [
    `${currency0?.symbol ?? ''} / ${currency1?.symbol ?? ''}`,
    currency0?.symbol ?? '',
    currency1?.symbol ?? '',
  ]

  return {
    poolSymbol,
    currency0,
    currency1,
    symbol0,
    symbol1,
  }
}
