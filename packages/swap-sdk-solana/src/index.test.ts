import { expect, test } from 'vitest'
import * as exports from './index'

test('exports', () => {
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "WSOLMint",
      "SOLMint",
      "SOL_INFO",
      "TOKEN_WSOL",
      "WSOL",
      "SPLNative",
      "SOL",
      "tryParsePublicKey",
      "validateAndParsePublicKey",
      "isSolWSolToken",
      "isSol",
      "isWSol",
      "isSolWSol",
      "solToWSol",
      "wSolToSol",
    ]
  `)
})
