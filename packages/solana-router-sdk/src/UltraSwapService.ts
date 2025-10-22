import { BalanceResponse, RouterResponse, UltraQuoteResponse, UltraSwapQuoteParams, UltraSwapResponse } from './types'

export enum Severity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export type Warning = {
  type: string
  message: string
  severity: Severity
}

export interface ShieldResponse {
  warnings: {
    [mintAddress: string]: Warning[]
  }
}

interface IUltraSwapService {
  getQuote(params: UltraSwapQuoteParams): Promise<UltraQuoteResponse>
  submitSwap(signedTransaction: string, requestId: string): Promise<UltraSwapResponse>
}

class UltraSwapService implements IUltraSwapService {
  private BASE_URL = 'https://lite-api.jup.ag/ultra/v1'

  private ROUTE = {
    SWAP: `${this.BASE_URL}/execute`,
    ORDER: `${this.BASE_URL}/order`,
    ROUTERS: `${this.BASE_URL}/order/routers`,
    BALANCES: `${this.BASE_URL}/balances`,
    SHIELD: `${this.BASE_URL}/shield`,
  }

  async getQuote(params: UltraSwapQuoteParams, signal?: AbortSignal): Promise<UltraQuoteResponse> {
    const queryParams = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value.toString(),
          }),
          {},
        ),
    )

    const response = await fetch(`${this.ROUTE.ORDER}?${queryParams.toString()}`, { signal })
    if (!response.ok) {
      throw response
    }
    const result = await response.json()
    return result
  }

  async submitSwap(signedTransaction: string, requestId: string): Promise<UltraSwapResponse> {
    const response = await fetch(this.ROUTE.SWAP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedTransaction, requestId }),
    })
    if (!response.ok) {
      throw response
    }
    const result = await response.json()
    return result
  }

  async getRouters(): Promise<RouterResponse> {
    const response = await fetch(this.ROUTE.ROUTERS)
    if (!response.ok) {
      throw response
    }
    const result = await response.json()
    return result
  }

  async getBalance(address: string, signal?: AbortSignal): Promise<BalanceResponse> {
    const response = await fetch(`${this.ROUTE.BALANCES}/${address}`, { signal })
    if (!response.ok) {
      throw response
    }
    const result = await response.json()
    return result
  }

  async getShield(mintAddress: string[]): Promise<ShieldResponse> {
    const response = await fetch(`${this.ROUTE.SHIELD}?mints=${mintAddress.join(',')}`)
    if (!response.ok) {
      throw response
    }
    const result = await response.json()
    return result
  }
}

export const ultraSwapService = new UltraSwapService()
