import type { Pool } from '@pancakeswap/routing-sdk'

import { INFI_BIN_POOL_TYPE } from '../constants'
import { InfinityBinPool } from '../types'

export function isInfinityBinPool(p: Pool): p is InfinityBinPool {
  return p.type === INFI_BIN_POOL_TYPE
}
