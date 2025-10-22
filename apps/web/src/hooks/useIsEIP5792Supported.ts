import { useActiveChainId } from 'hooks/useActiveChainId'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import { Address, createWalletClient, custom } from 'viem'
import { eip5792Actions } from 'viem/experimental'
import { useAccount, type Connector } from 'wagmi'

export type AtomicStatus = 'ready' | 'supported' | 'unsupported'

interface ChainCapabilities {
  atomic?: {
    status: AtomicStatus
  }
}

interface WalletCapabilities {
  [chainId: number]: ChainCapabilities
}

interface FetchParams {
  address: string | undefined
  connector: Connector | undefined
  chainId: number | undefined
}

const fetchCapabilities = async ({ address, connector }: FetchParams): Promise<WalletCapabilities | null> => {
  if (!connector || !address) {
    return null
  }

  try {
    const provider = await connector.getProvider()
    const client = createWalletClient({
      transport: custom(provider as any),
    }).extend(eip5792Actions())

    const capabilities = await client.getCapabilities({
      account: address as Address,
    })

    return capabilities
  } catch (error) {
    console.error('Error checking EIP-5792 support:', error)
    return null
  }
}

// According to the EIP‑5792 spec, `atomic.status` will be `'supported'` when the
// wallet can upgrade the account but the user has not yet done so. An account is
// considered ready for batching only when the status is `'ready'`.
const isSupported = (capabilities: WalletCapabilities | null | undefined, chainId?: number) => {
  if (!capabilities) return false

  const check = (chain: ChainCapabilities | undefined) => chain?.atomic?.status === 'ready'

  return chainId ? check(capabilities[chainId]) : Object.values(capabilities).some(check)
}

const getStatus = (capabilities: WalletCapabilities | null | undefined, chainId?: number): AtomicStatus => {
  if (!capabilities) return 'unsupported'
  const chain = chainId ? capabilities[chainId] : undefined
  return chain?.atomic?.status ?? 'unsupported'
}

const eip5792CapabilitiesAtom = atomFamily((params: FetchParams) => {
  return atomWithLoadable(async () => {
    if (!params.address || !params.connector) {
      return null
    }
    return fetchCapabilities(params)
  })
}, isEqual)

const eip5792SupportAtom = atomFamily((params: FetchParams) => {
  return atom((get) => {
    if (!params.address || !params.connector) {
      return false
    }
    const capabilities = get(eip5792CapabilitiesAtom(params))
    return capabilities.map((data) => isSupported(data, params.chainId)).unwrapOr(false)
  })
}, isEqual)

const eip5792StatusAtom = atomFamily((params: FetchParams) => {
  return atom((get) => {
    if (!params.address || !params.connector) {
      return 'unsupported' as AtomicStatus
    }
    const capabilities = get(eip5792CapabilitiesAtom(params))
    return capabilities.map((data) => getStatus(data, params.chainId)).unwrapOr('unsupported' as AtomicStatus)
  })
}, isEqual)

export const useIsEIP5792Supported = () => {
  const { chainId } = useActiveChainId()
  const { connector, address } = useAccount()

  const params = {
    address,
    connector,
    chainId,
  }

  return useAtomValue(eip5792SupportAtom(params))
}

export const useEIP5792Status = (): AtomicStatus => {
  const { chainId } = useActiveChainId()
  const { connector, address } = useAccount()

  const params = {
    address,
    connector,
    chainId,
  }

  return useAtomValue(eip5792StatusAtom(params))
}
