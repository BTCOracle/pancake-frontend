import { BaseCurrency } from './baseCurrency'
import { ZERO_ADDRESS } from './constants'
import { Token } from './token'

/**
 * Represents the native currency of the chain on which it resides, e.g.
 */
export abstract class NativeCurrency extends BaseCurrency<Token> {
  public readonly isNative = true as const

  public readonly isToken = false as const

  public override get asToken(): Token {
    return new Token(this.chainId, ZERO_ADDRESS, this.decimals, this.symbol, this.name)
  }
}
