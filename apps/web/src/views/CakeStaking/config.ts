import addresses from 'config/constants/contracts'
import { ChainId } from '@pancakeswap/chains'

export const poolStartWeekCursors = {
  [addresses.revenueSharingCakePool[ChainId.BSC]]: 1700697600,
  [addresses.revenueSharingCakePool[ChainId.BSC_TESTNET]]: 1700697600,
  [addresses.revenueSharingVeCake[ChainId.BSC]]: 1700697600,
  [addresses.revenueSharingVeCake[ChainId.BSC_TESTNET]]: 1700697600,
} as const
