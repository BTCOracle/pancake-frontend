import { PublicKey } from '@solana/web3.js'

export type PublicKeyish = PublicKey | string

interface TransferFeeDataBaseType {
  transferFeeConfigAuthority: string
  withdrawWithheldAuthority: string
  withheldAmount: string
  olderTransferFee: {
    epoch: string
    maximumFee: string
    transferFeeBasisPoints: number
  }
  newerTransferFee: {
    epoch: string
    maximumFee: string
    transferFeeBasisPoints: number
  }
}

export type TokenInfo = {
  chainId: number
  address: string
  programId: string
  logoURI: string
  symbol: string
  name: string
  decimals: number
  tags?: string[] // "hasFreeze" | "hasTransferFee" | "token-2022" | "community" | "unknown" ..etc
  extensions?: {
    coingeckoId?: string
    feeConfig?: TransferFeeDataBaseType
  }
  freezeAuthority?: string
  mintAuthority?: string
  priority: number
  userAdded?: boolean
  type?: string
}
