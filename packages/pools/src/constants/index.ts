import { AVERAGE_CHAIN_BLOCK_TIMES, ChainId } from '@pancakeswap/chains'

export * from './pools'
export * from './boostedPools'
export * from './contracts'
export * from './supportedChains'

// BNB Chain Maxwell upgrade reduces block time from 1.5s to 0.75s
export const BSC_BLOCK_TIME = AVERAGE_CHAIN_BLOCK_TIMES[ChainId.BSC]

export const BLOCKS_PER_DAY = (60 / BSC_BLOCK_TIME) * 60 * 24
export const BLOCKS_PER_YEAR = BLOCKS_PER_DAY * 365 // 42048000

export const SECONDS_IN_YEAR = 31536000 // 365 * 24 * 60 * 60
