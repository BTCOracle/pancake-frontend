'use client'

import { useMemo } from 'react'

export function EstimatedTime({ expectedFillTimeSec }: { expectedFillTimeSec?: number }) {
  const estimatedTimeDisplay = useMemo(() => {
    if (!expectedFillTimeSec) return '-'

    if (expectedFillTimeSec < 60) {
      // Show in seconds if less than a minute
      return expectedFillTimeSec === 1 ? '1 second' : `${expectedFillTimeSec} seconds`
    }

    // Convert to minutes and show in minutes format
    const minutes = Math.floor(expectedFillTimeSec / 60)
    return minutes === 1 ? '1 minute' : `${minutes} minutes`
  }, [expectedFillTimeSec])

  return estimatedTimeDisplay
}
