import { describe, it, expect } from 'vitest'
import { CurrencyAmount, Native, ERC20Token } from '@pancakeswap/sdk'
import { generateCreateGiftParams } from './generateCreateGiftParams'

// NOTE: don't remove this test or you get fired
// It's the most important test for the gift feature

// Mock tokens for testing
const BNB = Native.onChain(56) // BSC native token
const CAKE = new ERC20Token(56, '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', 18, 'CAKE', 'PancakeSwap Token')

// Constants
const EIGHTEEN_DECIMALS = 10n ** 18n
const GAS_PAYMENT = 75000000000000n // 0.000075 BNB in wei

describe('generateCreateGiftParams', () => {
  describe('Native token only in gift', () => {
    it('should correctly calculate parameters for 0.01 BNB gift', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(BNB, (1n * EIGHTEEN_DECIMALS) / 100n) // 0.01 BNB

      const result = generateCreateGiftParams({
        tokenAmount: nativeAmount,
        gasPaymentBigInt: GAS_PAYMENT,
      })

      expect(result.tokenAddress).toBe('0x0000000000000000000000000000000000000000') // zeroAddress
      expect(result.tokenAmountBigInt).toBe(0n) // Native token amount goes to native, not token
      expect(result.nativeAmountBigInt).toBe((1n * EIGHTEEN_DECIMALS) / 100n) // 0.01 BNB
      expect(result.transactionValue).toBe((1n * EIGHTEEN_DECIMALS) / 100n + GAS_PAYMENT) // 0.01 + 0.000075 = 0.010075 BNB
    })

    it('should correctly calculate parameters for different native amounts', () => {
      const nativeAmount = CurrencyAmount.fromRawAmount(BNB, (5n * EIGHTEEN_DECIMALS) / 100n) // 0.05 BNB

      const result = generateCreateGiftParams({
        tokenAmount: nativeAmount,
        gasPaymentBigInt: GAS_PAYMENT,
      })

      expect(result.tokenAddress).toBe('0x0000000000000000000000000000000000000000')
      expect(result.tokenAmountBigInt).toBe(0n)
      expect(result.nativeAmountBigInt).toBe((5n * EIGHTEEN_DECIMALS) / 100n) // 0.05 BNB
      expect(result.transactionValue).toBe((5n * EIGHTEEN_DECIMALS) / 100n + GAS_PAYMENT) // 0.05 + 0.000075 BNB
    })
  })

  describe('ERC20 token only in gift', () => {
    it('should correctly calculate parameters for ERC20 token with 0 BNB', () => {
      const tokenAmount = CurrencyAmount.fromRawAmount(CAKE, 100n * EIGHTEEN_DECIMALS) // 100 CAKE

      const result = generateCreateGiftParams({
        tokenAmount,
        gasPaymentBigInt: GAS_PAYMENT,
      })

      expect(result.tokenAddress).toBe('0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82') // CAKE address
      expect(result.tokenAmountBigInt).toBe(100n * EIGHTEEN_DECIMALS) // 100 CAKE
      expect(result.nativeAmountBigInt).toBe(0n) // No native amount
      expect(result.transactionValue).toBe(GAS_PAYMENT) // 0 + 0.000075 = 0.000075 BNB
    })

    it('should correctly calculate parameters for different ERC20 amounts', () => {
      const tokenAmount = CurrencyAmount.fromRawAmount(CAKE, 50n * EIGHTEEN_DECIMALS) // 50 CAKE

      const result = generateCreateGiftParams({
        tokenAmount,
        gasPaymentBigInt: GAS_PAYMENT,
      })

      expect(result.tokenAddress).toBe('0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82')
      expect(result.tokenAmountBigInt).toBe(50n * EIGHTEEN_DECIMALS) // 50 CAKE
      expect(result.nativeAmountBigInt).toBe(0n)
      expect(result.transactionValue).toBe(GAS_PAYMENT) // 0.000075 BNB
    })
  })

  describe('Token + Native in gift', () => {
    it('should correctly calculate parameters for ERC20 token + 0.02 BNB', () => {
      const tokenAmount = CurrencyAmount.fromRawAmount(CAKE, 100n * EIGHTEEN_DECIMALS) // 100 CAKE
      const nativeAmount = CurrencyAmount.fromRawAmount(BNB, (2n * EIGHTEEN_DECIMALS) / 100n) // 0.02 BNB

      const result = generateCreateGiftParams({
        tokenAmount,
        nativeAmount,
        gasPaymentBigInt: GAS_PAYMENT,
      })

      expect(result.tokenAddress).toBe('0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82') // CAKE address
      expect(result.tokenAmountBigInt).toBe(100n * EIGHTEEN_DECIMALS) // 100 CAKE
      expect(result.nativeAmountBigInt).toBe((2n * EIGHTEEN_DECIMALS) / 100n) // 0.02 BNB
      expect(result.transactionValue).toBe((2n * EIGHTEEN_DECIMALS) / 100n + GAS_PAYMENT) // 0.02 + 0.000075 = 0.020075 BNB
    })

    it('should correctly calculate parameters for different token + native combinations', () => {
      const tokenAmount = CurrencyAmount.fromRawAmount(CAKE, 25n * EIGHTEEN_DECIMALS) // 25 CAKE
      const nativeAmount = CurrencyAmount.fromRawAmount(BNB, (15n * EIGHTEEN_DECIMALS) / 1000n) // 0.015 BNB

      const result = generateCreateGiftParams({
        tokenAmount,
        nativeAmount,
        gasPaymentBigInt: GAS_PAYMENT,
      })

      expect(result.tokenAddress).toBe('0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82')
      expect(result.tokenAmountBigInt).toBe(25n * EIGHTEEN_DECIMALS) // 25 CAKE
      expect(result.nativeAmountBigInt).toBe((15n * EIGHTEEN_DECIMALS) / 1000n) // 0.015 BNB
      expect(result.transactionValue).toBe((15n * EIGHTEEN_DECIMALS) / 1000n + GAS_PAYMENT) // 0.015 + 0.000075 BNB
    })
  })
})
