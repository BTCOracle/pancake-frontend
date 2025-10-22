import { useMemo } from 'react'
import { useClmmAmmConfigs } from './useClmmAmmConfigs'

export const useSolanaClmmFeeTiers = () => {
  const configs = useClmmAmmConfigs()
  return useMemo<number[]>(() => {
    const rates = Object.values(configs).map((c) => c.tradeFeeRate)
    const unique = Array.from(new Set(rates))
    return unique.sort((a, b) => a - b)
  }, [configs])
}
