import { keccak256 } from 'viem'
import { MulticallRequestWithGas } from './types'

interface TimedSubCall {
  timestamp: number
  hash: string
}
interface TimedCall {
  timestamp: number
  callNumber: number
  targets: string[]
}

interface SlidingCallStats {
  // Holds raw events so we can slide the window
  events: TimedSubCall[]
  // Computed metrics
  total: number
  uniq: number
}

const stats: Record<string, SlidingCallStats> = {}
let statsCalls: TimedCall[] = []

const uniqTargets = new Set<string>()
let last = Date.now()
/**
 * Update the sliding‐window stats.
 * @param calls  Array of new calls to record
 * @param windowMs  How far back (in ms) to keep data (e.g. 1000 or 5000)
 */
export function logStatsInDev(
  calls: MulticallRequestWithGas[],
  windowMs = 5000, // default to 5s
) {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  statsCalls.push({
    timestamp: Date.now(),
    callNumber: calls.length,
    targets: [...new Set(calls.map((call) => call.target))],
  })
  statsCalls = statsCalls.filter((call) => call.timestamp >= Date.now() - windowMs)

  const now = Date.now()

  // 1) Record each incoming call with a timestamp+hash
  for (const call of calls) {
    const { target } = call
    if (!uniqTargets.has(target)) {
      console.log('target', call.target)
      uniqTargets.add(target)
    }
    const h = keccak256(`0x${target}${call.callData}`)

    if (!stats[target]) {
      stats[target] = { events: [], total: 0, uniq: 0 }
    }
    stats[target].events.push({ timestamp: now, hash: h })
  }

  const cutoff = now - windowMs

  // 2) For each target, purge old events and recompute metrics
  for (const [target, stat] of Object.entries(stats)) {
    // Keep only events within [now - windowMs, now]
    stat.events = stat.events.filter((e) => e.timestamp >= cutoff)

    // Recompute total / uniq
    stat.total = stat.events.length
    const uniqHashes = new Set(stat.events.map((e) => e.hash))
    stat.uniq = uniqHashes.size
  }

  const elapsed = Date.now() - last
  if (elapsed > 5000) {
    last = Date.now()
    console.log(`Sliding call stats`, stats)
    console.log(`history calls`, statsCalls)
  }
}
