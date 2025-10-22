import { describe, expect, it } from 'vitest'
import { isExpired } from './isExpired'

describe('isExpired', () => {
  it('should return true for timestamp in the past', () => {
    const pastTimestamp = new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    expect(isExpired(pastTimestamp)).toBe(true)
  })

  it('should return false for timestamp in the future', () => {
    const futureTimestamp = new Date(Date.now() + 1000 * 60 * 60).toISOString() // 1 hour from now
    expect(isExpired(futureTimestamp)).toBe(false)
  })

  it('should return false for current timestamp', () => {
    const currentTimestamp = new Date().toISOString()
    expect(isExpired(currentTimestamp)).toBe(false)
  })

  it('should handle edge case of timestamp exactly at current time', () => {
    const now = Date.now()
    const exactTimestamp = new Date(now).toISOString()
    // Mock Date.now to return the exact same timestamp
    const originalNow = Date.now
    Date.now = () => now
    expect(isExpired(exactTimestamp)).toBe(false)
    Date.now = originalNow
  })

  it('should handle ISO string format correctly', () => {
    const timestamp = '2023-01-01T00:00:00.000Z'
    expect(isExpired(timestamp)).toBe(true)
  })
})
