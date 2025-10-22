import { expect, test } from 'vitest'
import * as exportedNameSpaces from './index'

test('exports', () => {
  expect(Object.keys(exportedNameSpaces)).toMatchInlineSnapshot(`
    [
      "INFI_CL_POOL_TYPE",
      "INFI_BIN_POOL_TYPE",
      "COST_PER_UNINIT_TICK",
      "BASE_SWAP_COST_V3",
      "COST_PER_INIT_TICK",
      "COST_PER_HOP_V3",
      "NEGATIVE_ONE",
      "Q96",
      "Q192",
      "MAX_FEE",
      "ONE_HUNDRED_PERCENT",
      "ZERO_PERCENT",
      "Q128",
      "createInfinityBinPool",
      "createInfinityCLPool",
      "toSerializableBinPoolReserveOfBin",
      "toSerializableTick",
      "toSerializableInfinityCLPool",
      "toSerializableInfinityBinPool",
      "parseTick",
      "parseInfinityCLPool",
      "parseInfinityBinPoolReserveOfBins",
      "parseInfinityBinPool",
      "getInfinityPoolFee",
      "isInfinityBinPool",
      "isInfinityCLPool",
    ]
  `)
})
