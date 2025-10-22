import { expect, test } from 'vitest'
import { decodeHooksRegistration } from './decodeHooksRegistration'

test('decode hooks registration', () => {
  expect(decodeHooksRegistration('0x0000')).toEqual({})
  expect(decodeHooksRegistration(0)).toEqual({})

  expect(decodeHooksRegistration('0x0001')).toEqual({
    beforeInitialize: true,
  })
  expect(decodeHooksRegistration(1)).toEqual({
    beforeInitialize: true,
  })

  expect(decodeHooksRegistration('0x0002')).toEqual({
    afterInitialize: true,
  })
  expect(decodeHooksRegistration(2)).toEqual({
    afterInitialize: true,
  })

  expect(decodeHooksRegistration('0x0004')).toEqual({
    beforeAddLiquidity: true,
  })
  expect(decodeHooksRegistration(4)).toEqual({
    beforeAddLiquidity: true,
  })

  expect(decodeHooksRegistration('0x0008')).toEqual({
    afterAddLiquidity: true,
  })
  expect(decodeHooksRegistration(8)).toEqual({
    afterAddLiquidity: true,
  })

  expect(decodeHooksRegistration('0x0010')).toEqual({
    beforeRemoveLiquidity: true,
  })
  expect(decodeHooksRegistration(16)).toEqual({
    beforeRemoveLiquidity: true,
  })

  expect(decodeHooksRegistration('0x0020')).toEqual({
    afterRemoveLiquidity: true,
  })
  expect(decodeHooksRegistration(32)).toEqual({
    afterRemoveLiquidity: true,
  })

  expect(decodeHooksRegistration('0x0040')).toEqual({
    beforeSwap: true,
  })
  expect(decodeHooksRegistration(64)).toEqual({
    beforeSwap: true,
  })

  expect(decodeHooksRegistration('0x0080')).toEqual({
    afterSwap: true,
  })
  expect(decodeHooksRegistration(128)).toEqual({
    afterSwap: true,
  })

  expect(decodeHooksRegistration('0x0100')).toEqual({
    beforeDonate: true,
  })
  expect(decodeHooksRegistration(256)).toEqual({
    beforeDonate: true,
  })

  expect(decodeHooksRegistration('0x0200')).toEqual({
    afterDonate: true,
  })
  expect(decodeHooksRegistration(512)).toEqual({
    afterDonate: true,
  })

  expect(decodeHooksRegistration('0x03ff')).toEqual({
    beforeInitialize: true,
    afterInitialize: true,
    beforeAddLiquidity: true,
    afterAddLiquidity: true,
    beforeRemoveLiquidity: true,
    afterRemoveLiquidity: true,
    beforeSwap: true,
    afterSwap: true,
    beforeDonate: true,
    afterDonate: true,
  })
  expect(decodeHooksRegistration(1023)).toEqual({
    beforeInitialize: true,
    afterInitialize: true,
    beforeAddLiquidity: true,
    afterAddLiquidity: true,
    beforeRemoveLiquidity: true,
    afterRemoveLiquidity: true,
    beforeSwap: true,
    afterSwap: true,
    beforeDonate: true,
    afterDonate: true,
  })

  expect(() => decodeHooksRegistration('0x4000')).toThrow('Invariant failed: Invalid hooks registration')
  expect(() => decodeHooksRegistration(16384)).toThrow('Invariant failed: Invalid hooks registration')
  expect(() => decodeHooksRegistration(-1)).toThrow('Invariant failed: Invalid hooks registration')
})
