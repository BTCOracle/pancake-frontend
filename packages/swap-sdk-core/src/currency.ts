import type { NativeCurrency } from './nativeCurrency'
import { SPLNativeCurrency } from './splNativeCurrency'
import { SPLToken } from './splToken'
import type { Token } from './token'

export type Currency = NativeCurrency | Token

export type UnifiedNativeCurrency = NativeCurrency | SPLNativeCurrency
export type UnifiedCurrency = SPLToken | SPLNativeCurrency | Currency
export type UnifiedToken = SPLToken | Token
