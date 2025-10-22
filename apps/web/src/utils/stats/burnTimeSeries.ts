import { DUNE_ENDPOINTS } from './endpoints'
import { fetchFromDune } from './request'
import { DuneResponse } from './types'

interface Row {
  Cake_burn: number
  Cake_burn_USD: number
  name: string
  product_type: string
  week_start: string
}

/**
 * Burn Product Time Series
 */
export const getBurnTimeSeries = async () => {
  const response = await fetchFromDune(DUNE_ENDPOINTS.BURN_TIME_SERIES)
  const data: DuneResponse<Row> = await response.json()

  const result = {
    timestamp: new Date(data.execution_ended_at).getTime(),
    data: data.result.rows
      .map((row: Row) => ({
        timestamp: new Date(row.week_start).getTime(),
        burn: row.Cake_burn,
        burnUSD: row.Cake_burn_USD,
        product: row.name,
      }))
      .slice()
      // Filter out timestamps that are in the future
      .filter((row) => row.timestamp < Date.now())
      .sort((a, b) => a.timestamp - b.timestamp),
  }

  return result
}
