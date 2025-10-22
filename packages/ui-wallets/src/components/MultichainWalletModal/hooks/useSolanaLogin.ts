import { useIsMounted } from '@pancakeswap/hooks'
import { WalletName } from '@solana/wallet-adapter-base'
import { useLocalStorage, useWallet } from '@solana/wallet-adapter-react'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import { errorSolanaAtom } from '../../../state/atom'
import { SolanaProviderLocalStorageKey } from '../../SolanaProvider'

export const useSolanaLogin = () => {
  const { select, connected, publicKey, connecting } = useWallet()
  const [, setSolanaWalletName] = useLocalStorage(SolanaProviderLocalStorageKey, '')
  const solanaWalletError = useAtomValue(errorSolanaAtom)
  const isMounted = useIsMounted()

  const promiseRef = useRef<{
    promise: Promise<string>
    resolve: (address: string) => void
    reject: (error: string) => void
  } | null>(null)

  useEffect(() => {
    if (solanaWalletError && promiseRef.current) {
      promiseRef.current.reject(solanaWalletError)
      promiseRef.current = null
    } else if (connected && publicKey && promiseRef.current) {
      promiseRef.current.resolve(publicKey.toBase58())
      promiseRef.current = null
    }
  }, [solanaWalletError, connected, publicKey])

  useEffect(() => {
    if (!publicKey && isMounted && !connecting) {
      setSolanaWalletName('')
    }
  }, [publicKey, setSolanaWalletName, isMounted, connecting])

  const solanaLogin = useCallback(
    async (walletName: WalletName) => {
      setSolanaWalletName('')
      let resolve: (address: string) => void
      let reject: (error: string) => void
      const promise = new Promise<string>((res, rej) => {
        resolve = res
        reject = rej
      })

      promiseRef.current = { promise, resolve: resolve!, reject: reject! }

      select(walletName)

      return promise
    },
    [setSolanaWalletName, select],
  )

  return solanaLogin
}
