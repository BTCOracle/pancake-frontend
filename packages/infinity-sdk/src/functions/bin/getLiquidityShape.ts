import { BIN_SHAPE_DISTRIBUTION_SUM } from '../../constants/binPool'
import { BinLiquidityShape } from '../../types'
import { convertBinIdsToRelative } from '../../utils'

export type GetLiquidityShapeParams = {
  shape: BinLiquidityShape
  lowerBinId: number
  upperBinId: number
  amount0: bigint
  amount1: bigint
  activeIdDesired: number
}

export type LiquidityShape = {
  deltaIds: number[]
  distributionX: bigint[]
  distributionY: bigint[]
}

export const getLiquidityShape = ({
  shape,
  lowerBinId,
  upperBinId,
  activeIdDesired,
  amount0,
  amount1,
}: GetLiquidityShapeParams): LiquidityShape => {
  const binIds: number[] = []
  for (let i = lowerBinId; i <= upperBinId; i++) {
    binIds.push(i)
  }
  const relativeBinIds = convertBinIdsToRelative(binIds, activeIdDesired)

  switch (shape) {
    case BinLiquidityShape.Spot:
      return getSpotLiquidityShape({ binIds: relativeBinIds, amount0, amount1 })
    case BinLiquidityShape.Curve:
      return getCurveLiquidityShape({ binIds: relativeBinIds, amount0, amount1 })
    case BinLiquidityShape.BidAsk:
      return getBidAskLiquidityShape({ binIds: relativeBinIds, amount0, amount1 })
    default:
      throw new Error('Invalid liquidity shape')
  }
}

export type BinRange = [bigint, bigint]
export type GenerateLiquidityShapeParams = {
  binIds: number[]
  amount0: bigint
  amount1: bigint
}

export const getSpotLiquidityShape = ({ binIds, amount0, amount1 }: GenerateLiquidityShapeParams): LiquidityShape => {
  const deltaIds = binIds
  const distributionX: bigint[] = []
  const distributionY: bigint[] = []

  const token0Nums = binIds.filter((id) => id >= 0).length
  const token1Nums = binIds.filter((id) => id <= 0).length

  let token0Weight = 0
  let token1Weight = 0

  if (token0Nums > 0) {
    token0Weight = token1Nums === 0 ? token0Nums : token0Nums * 2 - 1
  }
  if (token1Nums > 0) {
    token1Weight = token0Nums === 0 ? token1Nums : token1Nums * 2 - 1
  }

  const token0Unit = amount0 > 0n && token0Weight > 0 ? (BIN_SHAPE_DISTRIBUTION_SUM - 1n) / BigInt(token0Weight) : 0n
  const token1Unit = amount1 > 0n && token1Weight > 0 ? (BIN_SHAPE_DISTRIBUTION_SUM - 1n) / BigInt(token1Weight) : 0n

  for (let i = 0; i < binIds.length; i++) {
    if (binIds[i] < 0 && amount1 > 0n) {
      distributionY[i] = token0Nums === 0 ? token1Unit : token1Unit * 2n
      distributionX[i] = 0n
    } else if (binIds[i] > 0 && amount0 > 0n) {
      distributionX[i] = token1Nums === 0 ? token0Unit : token0Unit * 2n
      distributionY[i] = 0n
    } else {
      distributionX[i] = token0Unit
      distributionY[i] = token1Unit
    }
  }

  return {
    deltaIds,
    distributionX,
    distributionY,
  }
}

/**
 * follow Gaussian Distribution Curve
 * @param param0
 * @returns
 */
export const getCurveLiquidityShape = ({
  binIds,
  amount0,
  amount1,
  sd = 1 / 5, // standard deviation
}: GenerateLiquidityShapeParams & { sd?: number }): LiquidityShape => {
  const deltaIds = binIds
  const distributionX: bigint[] = []
  const distributionY: bigint[] = []
  console.info('getCurveLiquidityShape', { binIds, amount0, amount1 })

  // calculate gaussian weights
  const gaussianWeights = binIds.map((id) => {
    const middleIndex = Math.floor(binIds.length / 2)
    const relativePosition = (id - binIds[middleIndex]) / binIds.length
    return Math.exp(-(relativePosition * relativePosition) / (2 * sd * sd))
  })

  let xNums = binIds.filter((id) => id >= 0).length
  let yNums = binIds.filter((id) => id <= 0).length
  let xSum = 0
  let ySum = 0

  const gaussianX: number[] = new Array(binIds.length).fill(0)
  const gaussianY: number[] = new Array(binIds.length).fill(0)

  binIds.forEach((id, i) => {
    if (id <= 0 && amount1 > 0n) {
      gaussianY[i] = gaussianWeights[i]
    }
    if (id >= 0 && amount0 > 0n) {
      gaussianX[i] = gaussianWeights[i]
    }

    if (id === 0 && amount0 > 0n && amount1 > 0n) {
      gaussianX[i] /= 2
      gaussianY[i] /= 2
    }

    xSum += gaussianX[i]
    ySum += gaussianY[i]
  })

  const xUnit = amount0 > 0n && xSum > 0n ? BigInt(Math.floor(Number(BIN_SHAPE_DISTRIBUTION_SUM - 1n) / xSum)) : 0n
  const yUnit = amount1 > 0n && ySum > 0n ? BigInt(Math.floor(Number(BIN_SHAPE_DISTRIBUTION_SUM - 1n) / ySum)) : 0n
  let xDistSum = BIN_SHAPE_DISTRIBUTION_SUM - 1n
  let yDistSum = BIN_SHAPE_DISTRIBUTION_SUM - 1n

  // calculate distribution
  for (let i = 0; i < binIds.length; i++) {
    if (binIds[i] < 0 && amount1 > 0n) {
      let weight = 0n
      yNums--
      if (yNums > 0) {
        weight = BigInt(Math.floor(Number(yUnit) * gaussianY[i]))
        yDistSum -= weight
      } else {
        weight = yDistSum
      }
      distributionX[i] = 0n
      distributionY[i] = weight
    } else if (binIds[i] > 0 && amount0 > 0n) {
      let weight = 0n
      xNums--
      if (xNums > 0) {
        weight = BigInt(Math.floor(Number(xUnit) * gaussianX[i]))
        xDistSum -= weight
      } else {
        weight = xDistSum
      }
      distributionX[i] = weight
      distributionY[i] = 0n
    } else if (binIds[i] === 0 && amount0 > 0n && amount1 > 0n) {
      let weightX = 0n
      xNums--
      if (xNums > 0) {
        weightX = BigInt(Math.floor(Number(xUnit) * gaussianX[i]))
        xDistSum -= weightX
      } else {
        weightX = xDistSum
      }
      distributionX[i] = weightX

      yNums--
      let weightY = 0n
      if (yNums > 0) {
        weightY = BigInt(Math.floor(Number(yUnit) * gaussianY[i]))
        yDistSum -= weightY
      } else {
        weightY = yDistSum
      }
      distributionY[i] = weightY
    }
  }

  return {
    deltaIds,
    distributionX,
    distributionY,
  }
}

export const getBidAskLiquidityShape = ({ binIds, amount0, amount1 }: GenerateLiquidityShapeParams): LiquidityShape => {
  const deltaIds = binIds
  const distributionX: bigint[] = []
  const distributionY: bigint[] = []

  const token0Nums = binIds.filter((id) => id >= 0).length
  const token1Nums = binIds.filter((id) => id <= 0).length

  const generateSequence = (n: number): number[] => {
    if (n <= 0) return []
    if (n === 1) return [1]

    const result: number[] = new Array<number>(n)

    const mid = Math.floor(n / 2)
    const max = Math.ceil(n / 2)

    for (let i = 0; i <= mid; i++) {
      result[i] = max - i
    }

    for (let i = n - 1; i >= mid; i--) {
      result[i] = max - (n - 1 - i)
    }

    return result
  }

  let sequence = generateSequence(binIds.length)

  let token0Weight = 0
  let token1Weight = 0

  if (token0Nums > 0 && token1Nums === 0) {
    token0Weight = sequence.reduce((acc, cur) => acc + cur, 0)
  } else if (token1Nums > 0 && token0Nums === 0) {
    token1Weight = sequence.reduce((acc, cur) => acc + cur, 0)
  } else {
    sequence = sequence.map((x) => (x === 1 ? x : 2 * x))

    binIds.forEach((id, i) => {
      if (id >= 0) token0Weight += sequence[i]
      if (id <= 0) token1Weight += sequence[i]
    })
  }

  const token0Unit = amount0 > 0n && token0Weight > 0 ? BIN_SHAPE_DISTRIBUTION_SUM / BigInt(token0Weight) : 0n
  const token1Unit = amount1 > 0n && token1Weight > 0 ? BIN_SHAPE_DISTRIBUTION_SUM / BigInt(token1Weight) : 0n

  for (let i = 0; i < binIds.length; i++) {
    const binId = binIds[i]

    if (binId < 0 && amount1 > 0n) {
      distributionX[i] = 0n
      distributionY[i] = token1Unit * BigInt(sequence[i])
    } else if (binId > 0 && amount0 > 0n) {
      distributionX[i] = token0Unit * BigInt(sequence[i])
      distributionY[i] = 0n
    } else {
      distributionX[i] = token0Unit * BigInt(sequence[i])
      distributionY[i] = token1Unit * BigInt(sequence[i])
    }
  }
  return {
    deltaIds,
    distributionX,
    distributionY,
  }
}
