import { formatDollarAmount } from './numbers'

describe('formatDollarAmount', () => {
  describe('edge cases', () => {
    it('should return "$0" for zero', () => {
      expect(formatDollarAmount(0)).toBe('$0')
    })

    it('should return "$0" for negative numbers', () => {
      expect(formatDollarAmount(-1)).toBe('$0')
      expect(formatDollarAmount(-0.5)).toBe('$0')
    })

    it('should return "-" for undefined', () => {
      expect(formatDollarAmount(undefined)).toBe('-')
    })

    it('should return "-" for null', () => {
      expect(formatDollarAmount(null as any)).toBe('-')
    })
  })

  describe('small amounts', () => {
    it('should return "<$0.001" for very small amounts when digits <= 3', () => {
      expect(formatDollarAmount(0.0001)).toBe('<$0.001')
      expect(formatDollarAmount(0.0005)).toBe('<$0.001')
      expect(formatDollarAmount(0.0009)).toBe('<$0.001')
    })

    it('should format small amounts normally when digits > 3', () => {
      expect(formatDollarAmount(0.0001, 4)).toBe('$0.0001')
      expect(formatDollarAmount(0.001, 5)).toBe('$0.001')
      expect(formatDollarAmount(0.0015, 4)).toBe('$0.0015')
    })
  })

  describe('decimal trimming', () => {
    it('should trim trailing zeros', () => {
      expect(formatDollarAmount(1.5)).toBe('$1.5')
      expect(formatDollarAmount(1.5)).toBe('$1.5')
      expect(formatDollarAmount(1.5)).toBe('$1.5')
      expect(formatDollarAmount(12.3)).toBe('$12.3')
      expect(formatDollarAmount(123.45)).toBe('$123.45')
    })

    it('should remove .00 for whole dollar amounts', () => {
      expect(formatDollarAmount(1.0)).toBe('$1')
      expect(formatDollarAmount(10.0)).toBe('$10')
      expect(formatDollarAmount(100.0)).toBe('$100')
    })

    it('should preserve significant decimal places', () => {
      expect(formatDollarAmount(1.23)).toBe('$1.23')
      expect(formatDollarAmount(1.234, 3)).toBe('$1.234')
      expect(formatDollarAmount(12.345, 3)).toBe('$12.345')
    })
  })

  describe('compact notation for large amounts', () => {
    it('should use compact notation by default for large amounts', () => {
      expect(formatDollarAmount(1500)).toBe('$1.5K')
      expect(formatDollarAmount(15000)).toBe('$15K')
      expect(formatDollarAmount(1500000)).toBe('$1.5M')
      expect(formatDollarAmount(1500000000)).toBe('$1.5B')
    })

    it('should trim zeros in compact notation', () => {
      expect(formatDollarAmount(1000)).toBe('$1K')
      expect(formatDollarAmount(10000)).toBe('$10K')
      expect(formatDollarAmount(1000000)).toBe('$1M')
    })

    it('should use standard notation when round=false', () => {
      expect(formatDollarAmount(1500, 2, false)).toBe('$1,500')
      expect(formatDollarAmount(15000, 2, false)).toBe('$15,000')
      expect(formatDollarAmount(1500000, 2, false)).toBe('$1,500,000')
    })
  })

  describe('digits parameter', () => {
    it('should respect digits parameter for small amounts', () => {
      expect(formatDollarAmount(1.2345, 1)).toBe('$1.2')
      expect(formatDollarAmount(1.2345, 2)).toBe('$1.23')
      expect(formatDollarAmount(1.2345, 3)).toBe('$1.235')
      expect(formatDollarAmount(1.2345, 4)).toBe('$1.2345')
    })

    it('should use 2 digits for large amounts regardless of digits parameter', () => {
      expect(formatDollarAmount(1500, 4)).toBe('$1.5K')
      expect(formatDollarAmount(15000, 1)).toBe('$15K')
    })
  })

  describe('real-world examples', () => {
    it('should format common price ranges correctly', () => {
      expect(formatDollarAmount(0.05)).toBe('$0.05')
      expect(formatDollarAmount(0.1)).toBe('$0.1')
      expect(formatDollarAmount(0.99)).toBe('$0.99')
      expect(formatDollarAmount(1)).toBe('$1')
      expect(formatDollarAmount(1.5)).toBe('$1.5')
      expect(formatDollarAmount(9.99)).toBe('$9.99')
      expect(formatDollarAmount(99.9)).toBe('$99.9')
      expect(formatDollarAmount(999)).toBe('$999')
    })

    it('should handle cryptocurrency-like decimals', () => {
      expect(formatDollarAmount(0.000123, 6)).toBe('$0.000123')
      expect(formatDollarAmount(0.00012, 6)).toBe('$0.00012')
      expect(formatDollarAmount(0.00123, 6)).toBe('$0.00123')
    })
  })
})
