import { useAccount } from 'wagmi'

// Known smart account connector IDs
const SMART_ACCOUNT_CONNECTOR_IDS = [
  'io.privy.smart_wallet', // Privy Smart Wallet
  // Add more smart account connector IDs here as needed
  // e.g., 'metamask.smart_account', 'coinbase.smart_wallet', etc.
]

/**
 * Hook to detect if the current wallet is a smart account (AA wallet)
 *
 * Currently checks for:
 * - Privy Smart Wallet
 *
 * This centralized approach makes it easier to add support for other
 * smart account types (like MetaMask Smart Accounts) in the future.
 */
export const useIsSmartAccount = (): boolean => {
  const { connector } = useAccount()

  return connector?.id ? SMART_ACCOUNT_CONNECTOR_IDS.includes(connector.id) : false
}
