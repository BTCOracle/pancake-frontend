import invariant from 'tiny-invariant'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { BaseCurrency } from './baseCurrency'
import { type UnifiedCurrency } from './currency'

export interface SerializedSPLToken {
  chainId: number
  address: string
  programId: string
  decimals: number
  symbol: string
  name?: string
  projectLink?: string
}

/**
 * Represents an SPL token on Solana or other non-EVM chains.
 */
export class SPLToken extends BaseCurrency<SPLToken> {
  public readonly isNative: false = false as const

  public readonly isToken: true = true as const

  public readonly address: string

  public readonly programId: string

  public readonly logoURI: string

  public readonly projectLink?: string

  public static isSPLToken(token?: UnifiedCurrency) {
    if (!token) return false

    return 'programId' in token || token.wrapped instanceof SPLToken
  }

  public constructor({
    chainId,
    programId,
    address,
    decimals,
    symbol,
    logoURI,
    name,
    projectLink,
  }: {
    chainId: number
    programId: string
    address: string
    decimals: number
    symbol: string
    logoURI: string
    name?: string
    projectLink?: string
    isNative?: boolean
  }) {
    super(chainId, decimals, symbol, name)
    this.address = address
    this.programId = programId
    this.logoURI = logoURI
    this.projectLink = projectLink
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and programId.
   * @param other other token to compare
   */
  public equals(other: BaseCurrency): boolean {
    return this.chainId === other.chainId && this.address === (other as SPLToken).address
  }

  public sortsBefore(other: SPLToken): boolean {
    invariant(this.chainId === other.chainId, 'CHAIN_IDS_MUST_MATCH')
    return new BN(new PublicKey(this.address).toBuffer()).lt(new BN(new PublicKey(other.address).toBuffer()))
  }

  /* For compatibility */
  public get wrapped(): SPLToken {
    return this
  }

  public get serialize(): SerializedSPLToken {
    return {
      address: this.address,
      programId: this.programId,
      chainId: this.chainId,
      decimals: this.decimals,
      symbol: this.symbol,
      name: this.name,
      projectLink: this.projectLink,
    }
  }
}
