import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'

/**
 * Determines if a tick-based position is out of range
 * Used in InfinityCL and V3 position tables
 */
export const isTickBasedPositionOutOfRange = (pool: any, tickLower: number, tickUpper: number): boolean => {
  return Boolean(pool && (pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper))
}

/**
 * Determines if a position is removed/closed for tick-based positions
 * Used in InfinityCL and V3 position tables
 */
export const isTickBasedPositionRemoved = (liquidity: bigint): boolean => {
  return liquidity === 0n
}

/**
 * Determines position status for Bin positions
 * Used in InfinityBin position table
 */
export const getBinPositionStatus = (status: POSITION_STATUS): { outOfRange: boolean; removed: boolean } => {
  return {
    removed: status === POSITION_STATUS.CLOSED,
    outOfRange: status === POSITION_STATUS.INACTIVE,
  }
}
