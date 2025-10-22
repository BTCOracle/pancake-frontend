import { expect, test } from 'vitest'
import { decodeBinPoolParameters, decodeCLPoolParameters } from './decodePoolParameters'
import { encodeCLPoolParameters } from './encodePoolParameters'

test('decode clPool params', () => {
  expect(decodeCLPoolParameters('0x000000000000000000000000000000000000000000000000000000b730300000')).toEqual({
    tickSpacing: -4771792,
    hooksRegistration: {},
  })

  expect(decodeCLPoolParameters('0x00000000000000000000000000000000000000000000000000000048cfd00000')).toEqual({
    tickSpacing: 4771792,
    hooksRegistration: {},
  })

  expect(decodeCLPoolParameters('0x0000000000000000000000000000000000000000000000000000000000800000')).toEqual({
    tickSpacing: 128,
    hooksRegistration: {},
  })

  expect(decodeCLPoolParameters('0x000000000000000000000000000000000000000000000000000000ffff800000')).toEqual({
    tickSpacing: -128,
    hooksRegistration: {},
  })

  expect(decodeCLPoolParameters('0x00000000000000000000000000000000000000000000000000000000000a0040')).toEqual({
    tickSpacing: 10,
    hooksRegistration: {
      beforeSwap: true,
    },
  })
})

const testCases = [
  {
    tickSpacing: 10,
    hooksRegistration: {
      beforeSwap: true,
    },
  },
  {
    tickSpacing: 128,
    hooksRegistration: {
      beforeSwap: true,
    },
  },
  {
    tickSpacing: 2 ** 23 - 1,
    hooksRegistration: {
      beforeSwap: true,
    },
  },
  {
    tickSpacing: -128,
    hooksRegistration: {
      beforeSwap: true,
    },
  },
  {
    tickSpacing: -(2 ** 23),
    hooksRegistration: {
      beforeSwap: true,
    },
  },
]

testCases.forEach((c) => {
  test(`decodeCLPoolParameters(encodeCLPoolParameters)`, () => {
    expect(decodeCLPoolParameters(encodeCLPoolParameters(c))).toEqual(c)
  })
})

test('decode bin pool params', () => {
  expect(decodeBinPoolParameters('0x00000000000000000000000000000000000000000000000000000000fffd0000')).toEqual({
    binStep: 65533,
    hooksRegistration: {},
  })
})
