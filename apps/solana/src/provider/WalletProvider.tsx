import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react'

import { type Adapter, type WalletError } from '@solana/wallet-adapter-base'
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import {
  BitgetWalletAdapter,
  BitpieWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  SafePalWalletAdapter,
  SolongWalletAdapter,
  TokenPocketWalletAdapter,
  TrustWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { initialize, SolflareWalletAdapter } from '@solflare-wallet/wallet-adapter'
import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter'
import { useEvent } from '@/hooks/useEvent'
import { logGTMSolErrorLogEvent } from '@/utils/report/curstomGTMEventTracking'

import { defaultEndpoint, defaultNetWork, useAppStore } from '../store/useAppStore'
import { BackpackWalletAdapter } from './walletAdapter/BackpackWalletAdapter'
import { OKXWalletAdapter } from './walletAdapter/OKXWalletAdapter'

initialize()

const App: FC<PropsWithChildren<any>> = ({ children }) => {
  const rpcNodeUrl = useAppStore((s) => s.rpcNodeUrl)
  const wsNodeUrl = useAppStore((s) => s.wsNodeUrl)
  const [endpoint, setEndpoint] = useState<string>(rpcNodeUrl || defaultEndpoint)

  const _walletConnect = useMemo(() => {
    const connectWallet: WalletConnectWalletAdapter[] = []
    try {
      connectWallet.push(
        new WalletConnectWalletAdapter({
          network: defaultNetWork,
          options: {
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PJ_ID,
            metadata: {
              name: 'PancakeSwap',
              description: 'Trade, earn, and own crypto on the all-in-one multichain DEX',
              url: 'https://solana.pancakeswap.finance/swap',
              icons: ['https://pancakeswap.finance/favicon.ico']
            }
          }
        })
      )
    } catch (e) {
      // console.error('WalletConnect error', e)
    }
    return connectWallet
  }, [])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SlopeWalletAdapter({ endpoint }),
      ..._walletConnect,
      new GlowWalletAdapter(),
      new TrustWalletAdapter(),
      new MathWalletAdapter({ endpoint }),
      new TokenPocketWalletAdapter(),
      new CoinbaseWalletAdapter({ endpoint }),
      new SolongWalletAdapter({ endpoint }),
      new Coin98WalletAdapter({ endpoint }),
      new SafePalWalletAdapter({ endpoint }),
      new BitpieWalletAdapter({ endpoint }),
      new BitgetWalletAdapter({ endpoint }),
      new ExodusWalletAdapter({ endpoint }),
      new OKXWalletAdapter(),
      new BackpackWalletAdapter()
    ],
    [endpoint, _walletConnect]
  )

  useEffect(() => {
    if (rpcNodeUrl) setEndpoint(rpcNodeUrl)
  }, [rpcNodeUrl])

  const onWalletError = useEvent((error: WalletError, adapter?: Adapter) => {
    if (!adapter) return
    logGTMSolErrorLogEvent({
      action: 'Wallet Connect Fail',
      e: error.message || error.stack
    })
  })

  return (
    <ConnectionProvider endpoint={endpoint} config={{ disableRetryOnRateLimit: true, wsEndpoint: wsNodeUrl }}>
      <WalletProvider wallets={wallets} onError={onWalletError} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
