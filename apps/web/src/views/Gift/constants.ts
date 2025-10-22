// bsc testnet

import { ChainId } from '@pancakeswap/chains'

export const GIFT_PANCAKE_V1_ADDRESS = '0x68E5f51980e2AcbB9817E34f3A2db71F5Ce2ecE3'

// @ts-ignore
export const NEXT_PUBLIC_GIFT_API = process.env.NEXT_PUBLIC_GIFT_API

export const GIFT_CODE_LENGTH = 20

export const QUERY_KEY_GIFT_INFO = 'gift-info'

export const CHAINS_WITH_GIFT_CLAIM = [ChainId.BSC_TESTNET, ChainId.BSC] as const
