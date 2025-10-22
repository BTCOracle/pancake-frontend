import { ChainId } from '@pancakeswap/chains'
import { atom } from 'jotai'
import { getHashKey } from 'utils/hash'
import { Connector } from 'wagmi'
import { getQueryChainId } from 'wallet/util/getQueryChainId'

export interface AccountChainState {
  account?: `0x${string}`
  solanaAccount?: string | null
  chainId: number
  isWrongNetwork: boolean
  isNotMatched: boolean
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | null
}

export const currentConnectorAtom = atom<Connector | null>(null)

const _accountActiveChainAtom = atom<AccountChainState>({
  chainId: getQueryChainId() || ChainId.BSC, // Mount with initial chain ID
  isWrongNetwork: false,
  status: null,
  solanaAccount: null,
  isNotMatched: false,
})

type Updater = AccountChainState | ((prev: AccountChainState) => AccountChainState)

export const accountActiveChainAtom = atom(
  (get) => {
    return get(_accountActiveChainAtom)
  },
  (_get, set, updater: Updater) => {
    const prev = _get(_accountActiveChainAtom)
    const hashPrev = getHashKey(prev)
    const nextState = typeof updater === 'function' ? updater(_get(_accountActiveChainAtom)) : updater
    const hash = getHashKey(nextState)
    if (hash !== hashPrev) {
      set(_accountActiveChainAtom, nextState)
    }
  },
)
