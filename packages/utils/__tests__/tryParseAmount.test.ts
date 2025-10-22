import { SPLToken, Token } from '@pancakeswap/swap-sdk-core'
import { describe, expect, it } from 'vitest'
import tryParseAmount from '../tryParseAmount'

describe('tryParseAmount', () => {
  const mockToken = new Token(
    56,
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    18,
    'CAKE',
    'PancakeSwap Token',
    'https://pancakeswap.finance/',
  )

  const mockSolanaToken = new SPLToken({
    chainId: 101, // Solana mainnet
    programId: 'So11111111111111111111111111111111111111112',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    symbol: 'SOL',
    logoURI: 'https://example.com/sol.png',
    name: 'Solana',
  })

  it('should parse a valid amount string and return CurrencyAmount', () => {
    const result = tryParseAmount('100', mockToken)

    expect(result).toBeDefined()
    expect(result?.currency).toEqual(mockToken)
    expect(result?.toExact()).toBe('100')
  })

  it('should parse a valid amount string for Solana currency and return UnifiedCurrencyAmount', () => {
    const result = tryParseAmount('50', mockSolanaToken)

    expect(result).toBeDefined()
    expect(result?.currency).toEqual(mockSolanaToken)
    expect(result?.toExact()).toBe('50')
    // Verify it's a Solana token with programId
    expect('programId' in result!.currency).toBe(true)
  })

  it('should preserve input currency reference in result for both EVM and Solana tokens', () => {
    // Test EVM token currency reference preservation
    const evmResult = tryParseAmount('25', mockToken)
    expect(evmResult?.currency).toBe(mockToken) // Same reference

    // Test Solana token currency reference preservation
    const solanaResult = tryParseAmount('25', mockSolanaToken)
    expect(solanaResult?.currency).toBe(mockSolanaToken) // Same reference
  })

  it('should return undefined for invalid inputs', () => {
    // No value provided
    expect(tryParseAmount(undefined, mockToken)).toBeUndefined()

    // Empty string
    expect(tryParseAmount('', mockToken)).toBeUndefined()

    // No currency provided
    expect(tryParseAmount('100', null)).toBeUndefined()

    // Zero amount
    expect(tryParseAmount('0', mockToken)).toBeUndefined()
    expect(tryParseAmount('0.00', mockToken)).toBeUndefined()

    // Same tests for Solana token
    expect(tryParseAmount('0', mockSolanaToken)).toBeUndefined()
    expect(tryParseAmount('', mockSolanaToken)).toBeUndefined()
  })
})
