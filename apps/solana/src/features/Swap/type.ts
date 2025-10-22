export type SwapType = 'exactIn' | 'exactOut'

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export type ApiSuccessResponse<T> = {
  success: true
  data: T
}
export type ApiErrorResponse = {
  success: false
  msg: string
}

export interface QuoteRequest {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
  swapType: SwapType
}

export type SwapCalldataRequest = {
  computeUnitPriceMicroLamports?: number
  outputAccount?: string
  swapResponse: QuoteResponseData
  unwrapSol?: boolean
  wrapSol?: boolean
  wallet: string
}

export type RoutePlanItem = {
  poolId: string
  inputMint: string
  outputMint: string
  feeMint: string
  feeRate: number
  feeAmount: string
  splitPercent: number
  routeIndex: number
}

export type RouteStats = {
  numSubRoutes: number
  totalHops: number
  avgHopsPerRoute: number
}
export type QuoteResponseData = {
  swapType: SwapType
  inputMint: string
  inputAmount: string
  outputMint: string
  outputAmount: string
  slippageBps: number
  priceImpactPct: number
  otherAmountThreshold?: string
  routePlan: RoutePlanItem[]
  routeStats: RouteStats
}
export type QuoteResponse = ApiResponse<QuoteResponseData>

export interface ApiSwapV1OutError {
  id: string
  success: false
  version: 'V0' | 'V1'
  msg: string
  openTime?: string
  data: undefined
}
export interface ApiSwapV1OutSuccess {
  id: string
  success: true
  version: 'V0' | 'V1'
  openTime?: undefined
  msg: undefined
  data: {
    swapType: SwapType
    inputMint: string
    inputAmount: string
    outputMint: string
    outputAmount: string
    otherAmountThreshold: string
    slippageBps: number
    priceImpactPct: number
    routePlan: {
      poolId: string
      inputMint: string
      outputMint: string
      feeMint: string
      feeRate: number
      feeAmount: string
    }[]
  }
}
