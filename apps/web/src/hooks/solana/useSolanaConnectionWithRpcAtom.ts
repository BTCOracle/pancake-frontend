import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { rpcUrlAtom } from '@pancakeswap/utils/user'
import { Connection } from '@solana/web3.js'

export function useSolanaConnectionWithRpcAtom() {
  const rpc = useAtomValue(rpcUrlAtom)

  return useMemo(() => {
    return new Connection(rpc)
  }, [rpc])
}
