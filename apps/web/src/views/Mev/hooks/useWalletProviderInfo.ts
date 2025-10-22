import { useEffect } from 'react'
import { useAccount } from 'wagmi'

// for debug wallet provider info and check the walletConnect detail in console
export function useWalletProviderInfo() {
  const { connector } = useAccount()

  useEffect(() => {
    const debugWallet = async () => {
      if (!connector) return

      try {
        const provider = (await connector.getProvider()) as any
        console.info('Provider full object:', provider)

        // check is WalletConnect
        console.info('Is WalletConnect:', provider.isWalletConnect)

        // try get session info
        if (provider.session) {
          console.info('Session:', provider.session)
          console.info('Peer metadata:', provider.session.peer?.metadata)
        }

        // check other possible paths
        if (provider.walletMeta) {
          console.info('Wallet meta:', provider.walletMeta)
        }

        if (provider.connector) {
          console.info('Provider connector:', provider.connector)
        }

        // 打印所有属性
        console.info('Provider keys:', Object.keys(provider))
      } catch (error) {
        console.error('Error in wallet debugger:', error)
      }
    }

    debugWallet()
  }, [connector])
}
