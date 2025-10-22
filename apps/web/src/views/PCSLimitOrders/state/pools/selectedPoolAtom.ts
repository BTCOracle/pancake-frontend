import { isPoolId } from 'hooks/infinity/utils/pool'
import { fetchCLPoolInfo } from 'state/farmsV4/state/accountPositions/fetcher/infinity/getPoolInfo'
import { getCurrencyAddress, Token } from '@pancakeswap/sdk'
import { Pool as CLPool, DYNAMIC_FEE_FLAG } from '@pancakeswap/infinity-sdk'
import { atomWithQuery } from 'jotai-tanstack-query'
import { FAST_INTERVAL } from 'config/constants'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import { supportedPoolsListAtom } from './poolsListAtom'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'

export const selectedPoolAtom = atomWithQuery((get) => {
  const { chainId } = get(accountActiveChainAtom)
  return {
    queryKey: ['selectedPool', chainId, get(inputCurrencyAtom), get(outputCurrencyAtom)],
    refetchInterval: FAST_INTERVAL,
    queryFn: async () => {
      const inputCurrency = get(inputCurrencyAtom)
      const outputCurrency = get(outputCurrencyAtom)

      if (!inputCurrency || !outputCurrency) return null

      const idA = getCurrencyAddress(inputCurrency)
      const idB = getCurrencyAddress(outputCurrency)

      const pools = await get(supportedPoolsListAtom)
      const basicPool = pools.find(
        (pool) =>
          pool.chainId === inputCurrency.chainId &&
          ((pool.currency0 === idA && pool.currency1 === idB) || (pool.currency0 === idB && pool.currency1 === idA)),
      )

      if (!basicPool || !isPoolId(basicPool.poolId)) return null

      const { poolId, chainId } = basicPool

      // Fetch CL pool info
      const poolInfo = await fetchCLPoolInfo(poolId, chainId)

      // Validate the pool
      if (!poolInfo || (!poolInfo.dynamic && poolInfo.fee >= 1e6)) return null

      const { currency0, fee, liquidity, lpFee, protocolFee, sqrtPriceX96, tick, parameters } = poolInfo

      // Sort currencies
      const zeroForOne = idA.toLowerCase() === currency0.toLowerCase()
      const [currencyA, currencyB] = zeroForOne ? [inputCurrency, outputCurrency] : [outputCurrency, inputCurrency]

      // Construct Pool
      const pool = new CLPool({
        poolType: 'CL',
        tokenA: currencyA as Token,
        tokenB: currencyB as Token,
        fee: lpFee,
        protocolFee,
        dynamic: fee === DYNAMIC_FEE_FLAG,
        sqrtRatioX96: sqrtPriceX96,
        liquidity,
        tickCurrent: tick,
        tickSpacing: parameters.tickSpacing,
      })
      pool.feeProtocol = protocolFee

      return { poolId, pool, poolInfo, zeroForOne, currencyA, currencyB }
    },
  }
})
