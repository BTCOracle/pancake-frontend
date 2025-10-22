import { useCallback, useMemo } from 'react'
import { Adapter, WalletError } from '@solana/wallet-adapter-base'
import {
  CoinbaseWalletAdapter,
  // SolflareWalletAdapter,
  WalletConnectWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { initialize, SolflareWalletAdapter } from '@solflare-wallet/wallet-adapter'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus'
import { useSetAtom } from 'jotai'
import { walletConnectConfig } from './walletConnect.config'
import { errorSolanaAtom } from '../../state/atom'

export type SolanaProviderProps = React.PropsWithChildren<{
  endpoint: string
}>

initialize()

export const SolanaProvider: React.FC<SolanaProviderProps> = ({ children, endpoint }) => {
  const walletConnectAdapter = useMemo(() => {
    const connectWallet: WalletConnectWalletAdapter[] = []
    try {
      connectWallet.push(new WalletConnectWalletAdapter(walletConnectConfig))
    } catch (e) {
      console.error('create WalletConnectAdapter error', e)
    }
    return connectWallet
  }, [])

  const setSolanaWalletError = useSetAtom(errorSolanaAtom)

  const onWalletError = useCallback(
    (error: WalletError, adapter?: Adapter) => {
      if (!adapter) return
      setSolanaWalletError((error.cause || error.message)?.toString())
    },
    [setSolanaWalletError],
  )

  // list of wallet adapter that not support WalletStandard
  const walletsAdapter = useMemo(
    () => [
      new SolflareWalletAdapter(),
      ...walletConnectAdapter,
      new GlowWalletAdapter(),
      new ExodusWalletAdapter({ endpoint }),
      new CoinbaseWalletAdapter(),
    ],
    [endpoint, walletConnectAdapter],
  )

  return (
    <ConnectionProvider endpoint={endpoint} config={{ disableRetryOnRateLimit: true }}>
      <WalletProvider
        autoConnect
        localStorageKey={SolanaProviderLocalStorageKey}
        onError={onWalletError}
        wallets={walletsAdapter}
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}

export const SolanaProviderLocalStorageKey = 'walletName'
