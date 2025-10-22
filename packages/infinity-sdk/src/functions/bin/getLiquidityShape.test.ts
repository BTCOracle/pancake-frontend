import { describe, expect, test } from 'vitest'
import { BIN_SHAPE_DISTRIBUTION_SUM } from '../../constants/binPool'
import { getBidAskLiquidityShape, getCurveLiquidityShape, getSpotLiquidityShape } from './getLiquidityShape'

describe('getLiquidityShape', () => {
  const params = {
    binIds: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
    amount0: 1n * BigInt(10 ** 18),
    amount1: BigInt(10 ** 18) / 2n,
  }
  const bothOdd = {
    binIds: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
    amount0: 1n * BigInt(10 ** 18),
    amount1: BigInt(10 ** 18) / 2n,
  }
  const bothEven = {
    binIds: [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
    amount0: 1n * BigInt(10 ** 18),
    amount1: BigInt(10 ** 18) / 2n,
  }
  const singleXParams = {
    binIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    amount0: 1n * BigInt(10 ** 18),
    amount1: 0n,
  }
  const singleXOdd = {
    binIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    amount0: 1n * BigInt(10 ** 18),
    amount1: 0n,
  }
  const singleXEven = {
    binIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    amount0: 1n * BigInt(10 ** 18),
    amount1: 0n,
  }
  const singleYParams = {
    binIds: [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1],
    amount0: 0n,
    amount1: 1n * BigInt(10 ** 18),
  }
  const singleYOdd = {
    binIds: [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1],
    amount0: 0n,
    amount1: 1n * BigInt(10 ** 18),
  }
  const singleYEven = {
    binIds: [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1],
    amount0: 0n,
    amount1: 1n * BigInt(10 ** 18),
  }
  test('getCurveLiquidityShape', () => {
    // const p = singleYParams
    // const p = params
    const p = singleXParams
    const result = getCurveLiquidityShape(p)

    expect(result.deltaIds).toEqual(p.binIds)

    const sum0 = result.distributionX.reduce((acc, cur) => acc + cur, 0n)
    const sum1 = result.distributionY.reduce((acc, cur) => acc + cur, 0n)

    // console.info({
    //   deltaIds: result.deltaIds,
    //   distributionX: result.distributionX.map((x) => Number(x)),
    //   distributionY: result.distributionY.map((y) => Number(y)),
    // })
    expect(sum0).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)
    expect(sum1).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)
  })
  test('getBidAskLiquidityShape: singleXOdd', () => {
    const result = getBidAskLiquidityShape(singleXOdd)

    expect(result.deltaIds).toEqual(singleXOdd.binIds)

    const sum0 = result.distributionX.reduce((acc, cur) => acc + cur, 0n)
    const sum1 = result.distributionY.reduce((acc, cur) => acc + cur, 0n)

    expect(sum0).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)
    expect(sum1).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)

    expect(sum0, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(singleXOdd.binIds.length)
    )
    expect(sum1).toBe(0n)
  })
  test('getBidAskLiquidityShape: singleXEven', () => {
    const result = getBidAskLiquidityShape(singleXEven)
    expect(result.deltaIds).toEqual(singleXEven.binIds)

    const sum0 = result.distributionX.reduce((acc, cur) => acc + cur, 0n)
    const sum1 = result.distributionY.reduce((acc, cur) => acc + cur, 0n)

    expect(sum0).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)
    expect(sum1).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)

    expect(sum0, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(singleXEven.binIds.length)
    )
    expect(sum1).toBe(0n)
  })
  test('getBidAskLiquidityShape: singleYOdd', () => {
    const result = getBidAskLiquidityShape(singleYOdd)
    expect(result.deltaIds).toEqual(singleYOdd.binIds)

    const sum0 = result.distributionX.reduce((acc, cur) => acc + cur, 0n)
    const sum1 = result.distributionY.reduce((acc, cur) => acc + cur, 0n)

    expect(sum0).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)
    expect(sum1).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)

    expect(sum0).toBe(0n)
    expect(sum1, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(singleYOdd.binIds.length)
    )
  })
  test('getBidAskLiquidityShape: singleYEven', () => {
    const result = getBidAskLiquidityShape(singleYEven)
    expect(result.deltaIds).toEqual(singleYEven.binIds)

    const sum0 = result.distributionX.reduce((acc, cur) => acc + cur, 0n)
    const sum1 = result.distributionY.reduce((acc, cur) => acc + cur, 0n)

    expect(sum0).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)
    expect(sum1).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)

    expect(sum0).toBe(0n)
    expect(sum1, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(singleYEven.binIds.length)
    )
  })
  test('getBidAskLiquidityShape: bothEven', () => {
    const result = getBidAskLiquidityShape(bothEven)

    expect(result.deltaIds).toEqual(bothEven.binIds)

    const sum0 = result.distributionX.reduce((acc, cur) => acc + cur, 0n)
    const sum1 = result.distributionY.reduce((acc, cur) => acc + cur, 0n)

    expect(sum0).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)
    expect(sum1).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)

    expect(sum0, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(bothEven.binIds.length)
    )
    expect(sum1, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(bothEven.binIds.length)
    )

    const activeId = bothEven.binIds.findIndex((id) => id === 0)
    const unitX = result.distributionX[activeId]
    const unitY = result.distributionY[activeId]
    result.distributionX.forEach((x, index) => {
      const binId = bothEven.binIds[index]
      if (binId < 0) {
        expect(x).toBe(0n)
      } else if (binId === 0) {
        expect(x).toBe(unitX)
      } else {
        expect(x).toBe(unitX * BigInt(binId * 2 + 2))
      }
    })
    result.distributionY.forEach((y, index) => {
      const binId = bothEven.binIds[index]
      if (binId > 0) {
        expect(y).toBe(0n)
      } else if (binId === 0) {
        expect(y).toBe(unitY)
      } else if (binId === -1 && bothEven.binIds.length % 2 === 0) {
        expect(y).toBe(unitY * BigInt(-binId * 1))
      } else {
        expect(y).toBe(unitY * BigInt(-binId * 2))
      }
    })
  })
  test('getBidAskLiquidityShape: bothOdd', () => {
    const result = getBidAskLiquidityShape(bothOdd)

    expect(result.deltaIds).toEqual(bothOdd.binIds)

    const sum0 = result.distributionX.reduce((acc, cur) => acc + cur, 0n)
    const sum1 = result.distributionY.reduce((acc, cur) => acc + cur, 0n)

    expect(sum0).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)
    expect(sum1).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)

    expect(sum0, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(bothOdd.binIds.length)
    )
    expect(sum1, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(bothOdd.binIds.length)
    )

    const activeId = bothOdd.binIds.findIndex((id) => id === 0)
    const unitX = result.distributionX[activeId]
    const unitY = result.distributionY[activeId]
    result.distributionX.forEach((x, index) => {
      const binId = bothOdd.binIds[index]
      if (binId < 0) {
        expect(x).toBe(0n)
      } else if (binId === 0) {
        expect(x).toBe(unitX)
      } else {
        expect(x).toBe(unitX * BigInt(binId * 2 + 2))
      }
    })
    result.distributionY.forEach((y, index) => {
      const binId = bothOdd.binIds[index]
      if (binId > 0) {
        expect(y).toBe(0n)
      } else if (binId === 0) {
        expect(y).toBe(unitY)
      } else {
        expect(y).toBe(unitY * BigInt(-binId * 2 + 2))
      }
    })
  })
  test('getSpotLiquidityShape', () => {
    const result = getSpotLiquidityShape(params)

    expect(result.deltaIds).toEqual(params.binIds)

    const sum0 = result.distributionX.reduce((acc, cur) => acc + cur, 0n)
    const sum1 = result.distributionY.reduce((acc, cur) => acc + cur, 0n)

    expect(sum0).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)
    expect(sum1).toBeLessThan(BIN_SHAPE_DISTRIBUTION_SUM)

    expect(sum0, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(params.binIds.length)
    )
    expect(sum1, 'should not far away from BIN_SHAPE_DISTRIBUTION_SUM').toBeGreaterThan(
      BIN_SHAPE_DISTRIBUTION_SUM - 5n * BigInt(params.binIds.length)
    )

    const activeId = params.binIds.findIndex((id) => id === 0)
    const unitX = result.distributionX[activeId]
    const unitY = result.distributionY[activeId]
    result.distributionX.forEach((x, index) => {
      const binId = params.binIds[index]
      if (binId < 0) {
        expect(x).toBe(0n)
      } else if (binId === 0) {
        expect(x).toBe(unitX)
      } else {
        expect(x).toBe(unitX * 2n)
      }
    })
    result.distributionY.forEach((y, index) => {
      const binId = params.binIds[index]
      if (binId > 0) {
        expect(y).toBe(0n)
      } else if (binId === 0) {
        expect(y).toBe(unitY)
      } else {
        expect(y).toBe(unitY * 2n)
      }
    })
  })
})
