import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { createAction } from '@reduxjs/toolkit'
import { CurrencyField as Field } from 'utils/types'

export const typeInput = createAction<{ field: Field; typedValue: string | undefined; noLiquidity: boolean }>(
  'mintV3/typeInputMint',
)
export const typeStartPriceInput = createAction<{ typedValue: string }>('mintV3/typeStartPriceInput')
export const typeLeftRangeInput = createAction<{ typedValue: Price<Currency, Currency> | undefined }>(
  'mintV3/typeLeftRangeInput',
)
export const typeRightRangeInput = createAction<{ typedValue: Price<Currency, Currency> | undefined }>(
  'mintV3/typeRightRangeInput',
)
export const resetMintState = createAction<void>('mintV3/resetMintState')
export const setFullRange = createAction<void>('mintV3/setFullRange')
