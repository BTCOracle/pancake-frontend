import { useAtomValue } from 'jotai'
import { solanaTokenAtomFamily } from 'state/token/solanaTokenAtoms'

import { SPLToken } from '@pancakeswap/swap-sdk-core'

export function useSolanaToken(address?: string): SPLToken | undefined {
  return useAtomValue(solanaTokenAtomFamily(address))
}
