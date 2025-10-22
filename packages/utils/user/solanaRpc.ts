import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

interface RpcItem {
  url: string
  ws?: string
  weight: number
  batch: boolean
  name: string
}

const parseRPCConf = (): RpcItem[] => {
  try {
    const rpcFromEnvVars = JSON.parse(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT_CONF ?? '[]')
    if (rpcFromEnvVars && Array.isArray(rpcFromEnvVars) && rpcFromEnvVars.length > 0) {
      return rpcFromEnvVars as RpcItem[]
    }
    return []
  } catch (e) {
    console.warn('Invalid RPC configuration, using fallback', e)
    return []
  }
}

export const rpcs: RpcItem[] = parseRPCConf()

export interface RPCConnectionState {
  url: string
  name?: string
}

export const isValidUrl = (url: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return true
  } catch (_error) {
    return false
  }
}
const RPC_STORAGE_KEY = 'solanaRpcConnection'

// Default to empty object - will be populated by the component
const defaultRpcState: RPCConnectionState = {
  url: rpcs[0]?.url || 'https://api.mainnet-beta.solana.com',
  name: rpcs[0]?.name,
}

export const rpcConnectionAtom = atomWithStorage<RPCConnectionState>(RPC_STORAGE_KEY, defaultRpcState)

// Atom to store current RPCs list (can be updated if necessary)
export const availableRpcsAtom = atom(rpcs)

// Atom to check if current URL is custom (not in RPCs)
export const isCustomRpcAtom = atom((get) => {
  const { url } = get(rpcConnectionAtom)
  return !rpcs.some((rpc) => rpc.url === url)
})

// Atom to get current RPC info
export const currentRpcInfoAtom = atom((get) => {
  const { url } = get(rpcConnectionAtom)
  const rpc = rpcs.find((r) => r.url === url)
  return rpc || { url, name: 'Custom', weight: 0, batch: true }
})

// Derived atom to extract just the URL
export const rpcUrlAtom = atom(
  (get) => get(rpcConnectionAtom).url,
  (_get, set, newUrl: string) => {
    if (isValidUrl(newUrl)) {
      const existingRpc = rpcs.find((rpc) => rpc.url === newUrl)
      set(rpcConnectionAtom, {
        url: newUrl,
        name: existingRpc ? existingRpc.name : 'Custom',
        isCustom: !existingRpc,
      })
    }
  },
)

// check RPC endpoint validity
export const validateRpcEndpoint = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getEpochInfo',
      }),
    })
    const data = await response.json()
    return !data.error
  } catch {
    return false
  }
}
