import { calculateBridgeFeeAmount } from '../crosschain-utils/utils/calculateBridgeFeeAmount'

describe('calculateBridgeFeeAmount', () => {
  describe('basic functionality', () => {
    it('should calculate bridge fee amount correctly', () => {
      expect(calculateBridgeFeeAmount('1.5', 6)).toBe(1500000)
      expect(calculateBridgeFeeAmount('0.1', 18)).toBe(100000000000000000)
      expect(calculateBridgeFeeAmount('100', 2)).toBe(10000)
    })

    it('should handle string numbers with decimals', () => {
      expect(calculateBridgeFeeAmount('1.23456', 4)).toBe(12345)
      expect(calculateBridgeFeeAmount('0.000001', 6)).toBe(1)
      expect(calculateBridgeFeeAmount('64229.999999999999', 6)).toBe(64230000000)
    })

    it('should handle integer string inputs', () => {
      expect(calculateBridgeFeeAmount('1', 6)).toBe(1000000)
      expect(calculateBridgeFeeAmount('10', 18)).toBe(10000000000000000000)
      expect(calculateBridgeFeeAmount('0', 6)).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle zero decimals', () => {
      expect(calculateBridgeFeeAmount('1.5', 0)).toBe(1)
      expect(calculateBridgeFeeAmount('999.9', 0)).toBe(999)
    })

    it('should handle zero fee', () => {
      expect(calculateBridgeFeeAmount('0', 6)).toBe(0)
      expect(calculateBridgeFeeAmount('0.0', 18)).toBe(0)
    })

    it('should handle negative fees by taking absolute value', () => {
      expect(calculateBridgeFeeAmount('-1.5', 6)).toBe(1500000)
      expect(calculateBridgeFeeAmount('-0.1', 18)).toBe(100000000000000000)
    })

    it('should handle very small amounts', () => {
      expect(calculateBridgeFeeAmount('0.000000001', 18)).toBe(1000000000)
      expect(calculateBridgeFeeAmount('0.000001', 6)).toBe(1)
    })

    it('should handle very large amounts', () => {
      expect(calculateBridgeFeeAmount('1000000', 6)).toBe(1000000000000)
      expect(calculateBridgeFeeAmount('999999.999999', 6)).toBe(999999999999)
    })

    it('should floor decimal results', () => {
      expect(calculateBridgeFeeAmount('1.9999', 2)).toBe(199) // floors 199.99
      expect(calculateBridgeFeeAmount('0.9999', 3)).toBe(999) // floors 999.9
    })
  })

  describe('invalid inputs', () => {
    it('should handle empty string', () => {
      expect(calculateBridgeFeeAmount('', 6)).toBe(0)
    })

    it('should handle non-numeric strings', () => {
      expect(calculateBridgeFeeAmount('abc', 6)).toBe(0)
      expect(calculateBridgeFeeAmount('1.2.3', 6)).toBe(0)
    })

    it('should handle negative decimals', () => {
      expect(calculateBridgeFeeAmount('1.5', -2)).toBe(0)
    })

    it('should handle Infinity and NaN inputs', () => {
      expect(calculateBridgeFeeAmount('Infinity', 6)).toBe(0)
      expect(calculateBridgeFeeAmount('-Infinity', 6)).toBe(0)
      expect(calculateBridgeFeeAmount('NaN', 6)).toBe(0)
    })
  })
})
