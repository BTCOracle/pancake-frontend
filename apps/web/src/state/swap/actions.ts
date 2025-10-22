import { PairDataTimeWindowEnum } from '@pancakeswap/uikit'
import { createAction } from '@reduxjs/toolkit'
import { DerivedPairDataNormalized, PairDataNormalized } from './types'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export const selectCurrency = createAction<{ field: Field; currencyId: string; chainId: number | undefined }>(
  'swap/selectCurrency',
)

export const switchCurrencies = createAction<void>('swap/switchCurrencies')
export const typeInput = createAction<{ field: Field; typedValue: string }>('swap/typeInput')
export const replaceSwapState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
  inputChainId?: number
  outputChainId?: number
}>('swap/replaceSwapState')
export const setRecipient = createAction<{ recipient: string | null }>('swap/setRecipient')
export const updatePairData = createAction<{
  pairData: PairDataNormalized
  pairId: string
  timeWindow: PairDataTimeWindowEnum
}>('swap/updatePairData')
export const updateDerivedPairData = createAction<{
  pairData: DerivedPairDataNormalized
  pairId: string
  timeWindow: PairDataTimeWindowEnum
}>('swap/updateDerivedPairData')
