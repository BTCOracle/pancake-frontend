import { DUNE_ENDPOINTS } from './endpoints'
import { fetchFromDune } from './request'
import { DuneResponse } from './types'

interface Row {
  From: string
  To: string
  Tx_hash: string
  cake_amt: number
  dt: string
  name: string
  product_type: string
}

/**
 * Burn History Table
 */
export const getBurnHistoryTable = async () => {
  const response = await fetchFromDune(DUNE_ENDPOINTS.BURN_HISTORY_TABLE)
  const data: DuneResponse<Row> = await response.json()

  const result = {
    timestamp: new Date(data.execution_ended_at).getTime(),
    data: data.result.rows
      .map((row: Row) => ({
        timestamp: new Date(row.dt).getTime(),
        type: row.name,
        amount: row.cake_amt,
        from: row.From,
        to: row.To,
        txHash: row.Tx_hash,
      }))
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp),
  }

  return result
}
