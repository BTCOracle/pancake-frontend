export interface BurnStats {
  timestamp: number
  total_supply: number
  total_burn: number
  total_mint: number
  weekly_burn: number
  weekly_mint: number
  weekly_new_supply: number
  totalSupplyTimeSeries: {
    timestamp: number
    total_supply: number
  }[]
  deflationTimeSeries: {
    timestamp: number
    deflation: number
    actualMint: number
    burn: number
  }[]
  burnTimeSeries: {
    timestamp: number
    burn: number
    burnUSD: number
    product: string
  }[]
  mintTimeSeries: {
    timestamp: number
    mint: number
    mintUSD: number
    product: string
  }[]
  burnHistoryTable: {
    timestamp: number
    type: string
    amount: number
    from: string
    to: string
    txHash: string
  }[]
}
