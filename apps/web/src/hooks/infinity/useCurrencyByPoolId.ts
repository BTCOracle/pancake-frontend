import { usePoolById } from 'hooks/infinity/usePool'
import { useInverted } from 'state/infinity/shared'
import { Address } from 'viem'

interface UseInfoByPoolIdProps {
  poolId?: Address
  chainId?: number
}

export const useCurrencyByPoolId = ({ poolId, chainId }: UseInfoByPoolIdProps) => {
  const [, pool] = usePoolById(poolId, chainId)
  const [inverted] = useInverted()

  if (!pool) {
    return {
      currency0: undefined,
      currency1: undefined,
      feeAmount: undefined,
      baseCurrency: undefined,
      quoteCurrency: undefined,
    }
  }

  const { token0, token1, fee } = pool

  return {
    currency0: token0,
    currency1: token1,
    feeAmount: fee,
    baseCurrency: inverted ? token1 : token0,
    quoteCurrency: inverted ? token0 : token1,
  }
}
