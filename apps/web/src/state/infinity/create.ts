import BigNumber from 'bignumber.js'
import { createParser, parseAsFloat, parseAsInteger, parseAsStringLiteral, useQueryState, useQueryStates } from 'nuqs'
import { isAddress } from 'viem/utils'

const parseAsAddress = createParser({
  parse: (queryValue: string) => {
    return isAddress(queryValue) ? queryValue : null
  },
  serialize: (value: string | null) => {
    return value ?? ''
  },
})

export const useBinStepQueryState = () => {
  return useQueryState(
    'binStep',
    parseAsInteger.withOptions({
      shallow: true,
    }),
  )
}

export const useClTickSpacingQueryState = () => {
  return useQueryState(
    'tickSpacing',
    parseAsInteger.withOptions({
      shallow: true,
    }),
  )
}

const parseAsFeeLevel = createParser<number | null>({
  parse: (queryValue: string) => {
    const n = parseFloat(queryValue)
    if (Number.isNaN(n)) return null
    const d = queryValue.split('.')[1]
    if (d && String(parseFloat(d)).length > 4) return parseFloat(Number(queryValue).toFixed(4))
    return n
  },
  serialize: (v: number | null) => {
    if (v === null) return ''
    return v.toString()
  },
})
export const useFeeLevelQueryState = () => {
  return useQueryState('feeLevel', parseAsFeeLevel.withOptions({ shallow: true }))
}

export const useFeeTierSettingQueryState = () => {
  return useQueryState(
    'feeTierSetting',
    parseAsStringLiteral(['static', 'dynamic'] as const)
      .withOptions({ shallow: true })
      .withDefault('static'),
  )
}

export const useHookAddressQueryState = () => {
  return useQueryState('hookAddress', parseAsAddress.withOptions({ shallow: true }))
}

export const usePoolTypeQueryState = () => {
  return useQueryState(
    'poolType',
    parseAsStringLiteral(['CL', 'Bin'] as const)
      .withOptions({
        shallow: true,
      })
      .withDefault('CL'),
  )
}

const parseAsPrice = createParser<string | null>({
  parse: (queryValue: string) => {
    const n = parseFloat(queryValue)
    if (Number.isNaN(n)) return null
    return new BigNumber(n).toJSON()
  },
  serialize: (v: string | null) => v ?? '',
})

export const useStartingPriceQueryState = () => {
  return useQueryState('startPrice', parseAsPrice.withOptions({ shallow: true }))
}

export const useActiveIdQueryState = () => {
  return useQueryState('activeId', parseAsInteger.withOptions({ shallow: true }))
}

export const usePriceRangeQueryState = () => {
  return useQueryStates({
    lowerPrice: parseAsFloat.withOptions({ shallow: true }),
    upperPrice: parseAsFloat.withOptions({ shallow: true }),
  })
}
