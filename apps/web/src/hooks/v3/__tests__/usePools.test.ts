import { Token } from '@pancakeswap/swap-sdk-core'
import { FeeAmount, Pool } from '@pancakeswap/v3-sdk'
import { describe, expect, it } from 'vitest'
import { PoolState } from '../types'
import { getPoolStateAndPool } from '../usePools'

describe('getPoolStateAndPool', () => {
  // Mock token data
  const token0 = new Token(1, '0x0000000000000000000000000000000000000001', 18, 't0', 'token0')
  const token1 = new Token(1, '0x0000000000000000000000000000000000000002', 18, 't1', 'token1')
  const fee = FeeAmount.MEDIUM

  it('should return LOADING state when isLoading is true', () => {
    const [state, pool] = getPoolStateAndPool([token0, token1, fee], undefined, undefined, true)
    expect(state).toBe(PoolState.LOADING)
    expect(pool).toBeNull()
  })

  it('should return INVALID state when tokens are undefined', () => {
    const [state, pool] = getPoolStateAndPool(undefined, undefined, undefined, false)
    expect(state).toBe(PoolState.INVALID)
    expect(pool).toBeNull()
  })

  it('should return NOT_EXISTS state when slot0 data is zero', () => {
    const [state, pool] = getPoolStateAndPool(
      [token0, token1, fee],
      { result: [0n, 0, 0, 0, 0, 0, false] },
      { result: 1000n },
      false,
    )
    expect(state).toBe(PoolState.NOT_EXISTS)
    expect(pool).toBeNull()
  })

  it('should return NOT_EXISTS state when liquidity data is zero', () => {
    const [state, pool] = getPoolStateAndPool(
      [token0, token1, fee],
      { result: [1n, 0, 0, 0, 0, 0, false] },
      { result: undefined },
      false,
    )
    expect(state).toBe(PoolState.NOT_EXISTS)
    expect(pool).toBeNull()
  })

  it('should return EXISTS state with valid pool when all data is valid', () => {
    const sqrtPriceX96 = 2n ** 96n
    const [state, pool] = getPoolStateAndPool(
      [token0, token1, fee],
      { result: [sqrtPriceX96, 0, 0, 0, 0, 0, false] },
      { result: 1000n },
      false,
    )
    expect(state).toBe(PoolState.EXISTS)
    expect(pool).toBeInstanceOf(Pool)
    expect(pool?.token0).toBe(token0)
    expect(pool?.token1).toBe(token1)
    expect(pool?.fee).toBe(fee)
  })
})
