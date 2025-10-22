import { atom } from 'jotai'
import { Connector } from 'wagmi'

export interface SwitchChainRequest {
  persistChain: boolean
  chainId: number
  replaceUrl: boolean // Replace url with chainId if succ
  wagmiConnector?: Connector // Connector used to switch chain
  evmAddress?: `0x${string}` // EVM address used to check session sync
  from: 'wagmi' | 'url' | 'switch' | 'connect'
  path: string
  pathname: string
  force?: boolean
}

export const switchChainUpdatingAtom = atom(false)
