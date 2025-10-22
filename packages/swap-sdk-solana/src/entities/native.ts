import { SPLNativeCurrency, SPLToken } from '@pancakeswap/swap-sdk-core'
import { SOL_INFO, WSOL } from '../constants'

/**
 *
 * Native is the main usage of a 'native' currency
 */
export class SPLNative extends SPLNativeCurrency {
  public readonly programId: string

  public readonly address: string

  public readonly logoURI: string

  constructor({
    chainId,
    decimals,
    name,
    symbol,
    programId,
    address,
    logoURI,
  }: {
    chainId: number
    decimals: number
    symbol: string
    name: string
    programId: string
    address: string
    logoURI: string
  }) {
    super(chainId, decimals, symbol, name)
    this.programId = programId
    this.address = address
    this.logoURI = logoURI
  }

  // eslint-disable-next-line class-methods-use-this
  public get wrapped(): SPLToken {
    return WSOL
  }

  public equals(other: SPLToken | SPLNativeCurrency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}

export const SOL = new SPLNative(SOL_INFO)
