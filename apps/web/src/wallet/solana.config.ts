import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'

export const defaultNetWork = WalletAdapterNetwork.Mainnet // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
export const defaultEndpoint = clusterApiUrl(defaultNetWork)
