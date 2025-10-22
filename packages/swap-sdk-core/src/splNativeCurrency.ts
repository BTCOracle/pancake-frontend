import { BaseCurrency } from './baseCurrency'
import { SPLToken } from './splToken'

/**
 * Represents the native currency of the chain on which it resides, e.g.
 */
export abstract class SPLNativeCurrency extends BaseCurrency<SPLToken> {
  public readonly isNative = true as const

  public readonly isToken = false as const

  public readonly address: string = ''
}
