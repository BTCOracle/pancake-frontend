import { CurrencyAmount, Native, SOL, UnifiedCurrencyAmount } from '@pancakeswap/sdk'
import { maxAmountSpend, maxUnifiedAmountSpend } from './maxAmountSpend'

describe('maxAmountSpend', () => {
  it('should be undefined if no input', () => {
    expect(maxAmountSpend()).toBeUndefined()
  })

  it('should has value when CurrencyAmount is BNB and CurrencyAmount is higher than min bnb', () => {
    const maxAmount = maxAmountSpend(CurrencyAmount.fromRawAmount(Native.onChain(56), 100n ** 16n))

    expect(maxAmount.quotient > 0n).toBeTruthy()
  })

  it('should be 0 when CurrencyAmount is BNB and CurrencyAmount is low', () => {
    expect(maxAmountSpend(CurrencyAmount.fromRawAmount(Native.onChain(56), '0')).quotient === 0n).toBeTruthy()
  })
})

describe('maxUnifiedAmountSpend', () => {
  it('should has value when CurrencyAmount is SOL and CurrencyAmount is higher than min reserve', () => {
    const maxAmount = maxUnifiedAmountSpend(UnifiedCurrencyAmount.fromRawAmount(SOL, 10n ** 8n))

    expect(maxAmount.quotient > 0n).toBeTruthy()
  })

  it('should be 0 when CurrencyAmount is SOL and CurrencyAmount is low', () => {
    expect(maxUnifiedAmountSpend(UnifiedCurrencyAmount.fromRawAmount(SOL, 0n)).quotient === 0n).toBeTruthy()
  })
})
