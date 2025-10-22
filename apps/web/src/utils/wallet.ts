import { memoizeAsync } from '@pancakeswap/utils/memoize'
import { Connector } from 'wagmi'

export const checkWalletCanRegisterToken = memoizeAsync(
  async (connector: Connector) => {
    try {
      if (typeof connector.getProvider !== 'function') return false

      const provider = (await connector.getProvider()) as any

      return (
        !!provider?.request &&
        typeof provider.request === 'function' &&
        // Some providers throw if they don’t support it
        (await provider
          .request({ method: 'wallet_watchAsset', params: {} })
          .then(() => true)
          .catch((err: any) => {
            if (err?.code === -32601 || err?.code === -32004) {
              throw err
            }
            return true // they support the method even if the dummy call fails
          }))
      )
    } catch (error: any) {
      // If the provider rejects "unknown method", it doesn’t support asset registration
      if (error?.code === -32601 || error?.code === -32004) {
        return false
      }
      console.error(error, 'Error while checking wallet token registration support')
      return false
    }
  },
  { resolver: (connector) => connector?.id },
)
