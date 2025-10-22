import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Connector, useAccount } from 'wagmi'

const checkIsWalletConnect = async (connector: Connector) => {
  try {
    if (typeof connector.getProvider !== 'function') return false

    const provider = (await connector.getProvider()) as any

    return Boolean(
      provider &&
        !provider.isSafePal &&
        !provider.isMetaMask &&
        !provider.isTrust &&
        !provider.isCoinbaseWallet &&
        !provider.isTokenPocket &&
        provider.isWalletConnect,
    )
  } catch (error) {
    console.error(error, 'Error detecting WalletConnect provider')
    return false
  }
}

export const useWalletConnectRouterSync = () => {
  const { connector } = useAccount()
  const router = useRouter()
  const [isWalletConnect, setIsWalletConnect] = useState(false)

  useEffect(() => {
    if (!connector) return

    const checkProvider = async () => {
      const result = await checkIsWalletConnect(connector)
      setIsWalletConnect(result)
    }

    checkProvider()
  }, [connector])

  useEffect(() => {
    if (!isWalletConnect) return undefined

    const onUrlChange = async () => {
      const params = new URLSearchParams(window.location.search)
      await router.replace(
        {
          pathname: window.location.pathname,
          query: Object.fromEntries(params.entries()),
          hash: window.location.hash,
        },
        undefined,
        { shallow: true },
      )
    }

    window.addEventListener('popstate#pcs', onUrlChange)
    return () => {
      window.removeEventListener('popstate#pcs', onUrlChange)
    }
  }, [router, isWalletConnect])
}
