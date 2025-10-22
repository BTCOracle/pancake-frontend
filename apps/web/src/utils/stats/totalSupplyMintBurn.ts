import { DUNE_ENDPOINTS } from './endpoints'
import { fetchFromDune } from './request'
import { DuneResponse } from './types'

interface Row {
  total_burn: number
  total_mint: number
  total_supply: number
  weekly_burn: number
  weekly_mint: number
  weekly_new_supply: number
}

export const getTotalSupplyMintBurn = async () => {
  const response = await fetchFromDune(DUNE_ENDPOINTS.TOTAL_SUPPLY_MINT_BURN)
  const data: DuneResponse<Row> = await response.json()

  const row = data.result.rows[0]
  const result = {
    timestamp: new Date(data.execution_ended_at).getTime(),
    data: {
      total_burn: row.total_burn,
      total_mint: row.total_mint,
      total_supply: row.total_supply,
      weekly_burn: row.weekly_burn,
      weekly_mint: row.weekly_mint,
    },
  }

  return result
}
