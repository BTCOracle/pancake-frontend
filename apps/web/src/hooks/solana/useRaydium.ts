import { atom, useAtom } from 'jotai'
import { useMemo, useCallback, useEffect, useRef } from 'react'
import { Raydium, SignAllTransactions, JupTokenType } from '@pancakeswap/solana-core-sdk'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { urlConfigs } from 'config/constants/endpoints'
import { useSolanaConnectionWithRpcAtom } from './useSolanaConnectionWithRpcAtom'

export const WALLET_STORAGE_KEY = 'walletName'

export const raydiumAtom = atom<Raydium | undefined>(undefined)

export const useRaydium = () => {
  const [raydium, setRaydium] = useAtom(raydiumAtom)
  const connection = useSolanaConnectionWithRpcAtom()
  const { publicKey: _publicKey, signAllTransactions, wallet, connected } = useWallet()
  const walletRef = useRef(wallet)

  const publicKey = useMemo(() => {
    return _publicKey
  }, [_publicKey])

  const initRaydium = useCallback(
    async ({
      connection,
      publicKey,
      signAllTransactions,
    }: {
      connection: Connection
      publicKey?: PublicKey
      signAllTransactions?: SignAllTransactions
    }) => {
      if (!connection) return

      try {
        const isDev = window.location.host.match(/^localhost:\d+/)

        const raydiumInstance = await Raydium.load({
          connection,
          owner: publicKey,
          urlConfigs,
          jupTokenType: JupTokenType.Strict,
          logRequests: !isDev,
          disableFeatureCheck: true,
          disableLoadToken: true,
          loopMultiTxStatus: true,
          blockhashCommitment: 'finalized',
        })

        if (signAllTransactions) {
          raydiumInstance.setSignAllTransactions(signAllTransactions)
        }

        setRaydium(raydiumInstance)
      } catch (error) {
        console.error('Failed to initialize Raydium:', error)
      }
    },
    [setRaydium],
  )

  useEffect(() => {
    walletRef.current = wallet || walletRef.current
  }, [wallet])

  useEffect(() => {
    if (!connection) return

    if (raydium) {
      raydium.setConnection(connection)
      return
    }

    initRaydium({
      connection,
      publicKey: publicKey || undefined,
      signAllTransactions: signAllTransactions || undefined,
    })
  }, [initRaydium, connection, raydium, publicKey, signAllTransactions])

  useEffect(() => {
    if (raydium) {
      raydium.setOwner(publicKey || undefined)
      raydium.setSignAllTransactions(signAllTransactions)
    }
  }, [raydium, publicKey, signAllTransactions])

  useEffect(() => {
    if (connected && publicKey) {
      // console.log('Wallet connected:', wallet?.adapter.name)
      if (walletRef.current) localStorage.setItem(WALLET_STORAGE_KEY, `"${wallet?.adapter.name}"`)
    }
  }, [publicKey, connected])

  return raydium
}
