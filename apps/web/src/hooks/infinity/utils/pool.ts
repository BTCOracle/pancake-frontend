import { isHex } from 'viem'

export const isPoolId = (poolId: string | undefined): boolean => !!poolId && poolId.length === 66 && isHex(poolId)
