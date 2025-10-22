import { useIsomorphicEffect } from '@pancakeswap/uikit'
import { logWeb3WalletViews } from 'utils/customGTMEventTracking'

export const useWeb3WalletView = () => {
  useIsomorphicEffect(() => {
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window?.ethereum?.isBinance) {
        logWeb3WalletViews()
      }
    } catch (error) {
      console.error('Error checking Binance wallet:', error)
    }
  }, [])
}
