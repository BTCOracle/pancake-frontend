import { useEffect, useState } from 'react'
import { useConnections, useConnectorClient } from 'wagmi'

/**
 * Metamask version < 13.3.0 has an issue that it can't connect to Solana and EVM at the same time.
 * This hook will check Metamask version and return true if it's less than 13.3.0.
 */

export const useMetamaskVersionWarning = () => {
  const connections = useConnections()
  const metaMask = connections.find((c) => c.connector.rdns?.includes?.('io.metamask'))?.connector
  const { data: walletClient } = useConnectorClient({ connector: metaMask })

  const [shouldShowMetamaskVersionWarning, toggleMetamaskVersionWarning] = useState<boolean>(false)

  useEffect(() => {
    walletClient?.request({ method: 'web3_clientVersion' }).then((clientVersion) => {
      // extract version
      const version =
        /MetaMask\/v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)/i.exec(clientVersion)?.[1] ?? null

      if (version && version < '13.3.0') {
        toggleMetamaskVersionWarning(true)
      } else {
        toggleMetamaskVersionWarning(false)
      }
    })
  }, [walletClient])

  return shouldShowMetamaskVersionWarning
}
