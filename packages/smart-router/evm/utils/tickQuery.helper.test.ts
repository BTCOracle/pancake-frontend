import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { FeeAmount, Tick, TICK_SPACINGS } from '@pancakeswap/v3-sdk'
import { Address, Hex, decodeFunctionResult, encodeFunctionData } from 'viem'
import { queryDataAbi } from '../abis/QueryData'
import { InfinityClPool, PoolType, V3Pool } from '../v3-router/types'

import {
  decodeCompactTickResult,
  decodeTicksFromBytes,
  getCompactTickQueryCalldata,
  getTickSpacing,
} from './compactTickQuery.helper'

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem')
  return {
    ...actual,
    decodeFunctionResult: vi.fn(),
  }
})

const decodeFunctionResultMock = decodeFunctionResult as unknown as Mock

const SHIFT = 128n

function buildRawTicksHex(entries: { index: number; liquidityNet: bigint }[]): Hex {
  const hex = entries
    .map(({ index, liquidityNet }) => {
      const encodedIndex = BigInt.asUintN(128, BigInt(index))
      const encodedLiquidity = BigInt.asUintN(128, liquidityNet)
      const raw = (encodedIndex << SHIFT) | encodedLiquidity
      return raw.toString(16).padStart(64, '0')
    })
    .join('')

  return `0x${hex}` as Hex
}

const v3Pool = {
  type: PoolType.V3,
  address: '0x0000000000000000000000000000000000000001' as Address,
  fee: FeeAmount.MEDIUM,
} as unknown as V3Pool

const infinityPool = {
  type: PoolType.InfinityCL,
  id: `0x${'11'.repeat(32)}`,
  tickSpacing: 15,
  fee: 100,
  poolManager: '0x0000000000000000000000000000000000000002' as Address,
} as unknown as InfinityClPool

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCompactTickQueryCalldata', () => {
  it('encodes V3 pool call data with pool address and length', () => {
    const len = 256n
    const expected = encodeFunctionData({
      abi: queryDataAbi,
      args: [v3Pool.address, len],
      functionName: 'queryUniv3TicksSuperCompact',
    })

    expect(getCompactTickQueryCalldata(v3Pool, len)).toEqual(expected)
  })

  it('encodes Infinity pool call data with pool id and length', () => {
    const len = 128n
    const expected = encodeFunctionData({
      abi: queryDataAbi,
      args: [infinityPool.id, len],
      functionName: 'queryPancakeInfinityTicksSuperCompact',
    })

    expect(getCompactTickQueryCalldata(infinityPool, len)).toEqual(expected)
  })
})

describe('decodeCompactTickResult', () => {
  it('decodes V3 pool tick data using the Uniswap query function', () => {
    const rawTicks = buildRawTicksHex([{ index: 15, liquidityNet: 9n }])
    decodeFunctionResultMock.mockReturnValueOnce(rawTicks)
    const encodedResult = '0xabc123' as Hex

    const decoded = decodeCompactTickResult(encodedResult, v3Pool)

    expect(decodeFunctionResultMock).toHaveBeenCalledWith(
      expect.objectContaining({
        abi: queryDataAbi,
        functionName: 'queryUniv3TicksSuperCompact',
        data: encodedResult,
      }),
    )

    expect(decoded).toHaveLength(1)
    expect(decoded[0]).toBeInstanceOf(Tick)
    expect(decoded[0]?.index).toBe(15)
    expect(decoded[0]?.liquidityNet).toBe(9n)
    expect(decoded[0]?.liquidityGross).toBe(9n)
  })

  it('decodes Infinity pool tick data using the Pancake Infinity query function', () => {
    const rawTicks = buildRawTicksHex([
      { index: -20, liquidityNet: -5n },
      { index: 10, liquidityNet: 12n },
    ])
    decodeFunctionResultMock.mockReturnValueOnce(rawTicks)
    const encodedResult = '0xdef456' as Hex

    const decoded = decodeCompactTickResult(encodedResult, infinityPool)

    expect(decodeFunctionResultMock).toHaveBeenCalledWith(
      expect.objectContaining({
        abi: queryDataAbi,
        functionName: 'queryPancakeInfinityTicksSuperCompact',
        data: encodedResult,
      }),
    )

    expect(decoded).toHaveLength(2)
    expect(decoded[0]).toBeInstanceOf(Tick)
    expect(decoded[0]?.index).toBe(-20)
    expect(decoded[0]?.liquidityNet).toBe(-5n)
    expect(decoded[0]?.liquidityGross).toBe(5n)
    expect(decoded[1]?.index).toBe(10)
    expect(decoded[1]?.liquidityNet).toBe(12n)
    expect(decoded[1]?.liquidityGross).toBe(12n)
  })
})

describe('decodeTicksFromBytes', () => {
  it('decodes full ticks data from compact V3 query result', () => {
    const rawTicks =
      '0x000000000000000000000000000d89e6ffffffffffffffffffe2d2de221bb280fffffffffffffffffffffffffff2761a0000000000000000001d2d21dde44d80' as Hex

    const decoded = decodeTicksFromBytes(rawTicks)

    expect(decoded).toHaveLength(2)
    expect(
      decoded.map((tick) => ({
        index: tick.index,
        liquidityNet: tick.liquidityNet,
        liquidityGross: tick.liquidityGross,
      })),
    ).toStrictEqual([
      {
        index: -887270,
        liquidityNet: 8212397804506496n,
        liquidityGross: 8212397804506496n,
      },
      {
        index: 887270,
        liquidityNet: -8212397804506496n,
        liquidityGross: 8212397804506496n,
      },
    ])
  })

  it('decodes infinity CL ticks data from compact query result', () => {
    const rawTicks =
      '0x00000000000000000000000000001e780000000000019f89e3aae1b5294d278e00000000000000000000000000001f400000000000000e6c7428fcce32239c6200000000000000000000000000002008000000000000e0441abfc1d957905144000000000000000000000000000020d0ffffffffffffde9bdb9e543d64ae37e100000000000000000000000000002198ffffffffffffeb4a2fef4781ebe2ba8200000000000000000000000000001db000000000000009115067b3495a3b2d7200000000000000000000000000001ce80000000000002b44d3e2b5675119c65c00000000000000000000000000001c20ffffffffffff465ca3061f93dc2efa5e00000000000000000000000000001b58000000000000541260d767c00ba1474400000000000000000000000000001a900000000000003c4637a365eaf778293d' as Hex

    const decoded = decodeTicksFromBytes(rawTicks)

    expect(decoded).toHaveLength(10)
    expect(
      decoded.map((tick) => ({
        index: tick.index,
        liquidityNet: tick.liquidityNet,
        liquidityGross: tick.liquidityGross,
      })),
    ).toStrictEqual([
      {
        index: 6800,
        liquidityNet: 284637270217491519908157n,
        liquidityGross: 284637270217491519908157n,
      },
      {
        index: 7000,
        liquidityNet: 397017804114599130253124n,
        liquidityGross: 397017804114599130253124n,
      },
      {
        index: 7200,
        liquidityNet: -876651318247574773761442n,
        liquidityGross: 876651318247574773761442n,
      },
      {
        index: 7400,
        liquidityNet: 204331405325549080004188n,
        liquidityGross: 204331405325549080004188n,
      },
      {
        index: 7600,
        liquidityNet: 42820686791653132545394n,
        liquidityGross: 42820686791653132545394n,
      },
      {
        index: 7800,
        liquidityNet: 1962325699501761820960654n,
        liquidityGross: 1962325699501761820960654n,
      },
      {
        index: 8000,
        liquidityNet: 68113749338005667290210n,
        liquidityGross: 68113749338005667290210n,
      },
      {
        index: 8200,
        liquidityNet: 1059066398232117536379204n,
        liquidityGross: 1059066398232117536379204n,
      },
      {
        index: 8400,
        liquidityNet: -157685389907379671386143n,
        liquidityGross: 157685389907379671386143n,
      },
      {
        index: 8600,
        liquidityNet: -97801183020745492350334n,
        liquidityGross: 97801183020745492350334n,
      },
    ])
  })
})

describe('getTickSpacing', () => {
  it('returns tick spacing from TICK_SPACINGS for V3 pools', () => {
    expect(getTickSpacing(v3Pool)).toBe(TICK_SPACINGS[FeeAmount.MEDIUM])
  })

  it('returns tickSpacing property for Infinity pools', () => {
    expect(getTickSpacing(infinityPool)).toBe(infinityPool.tickSpacing)
  })
})
