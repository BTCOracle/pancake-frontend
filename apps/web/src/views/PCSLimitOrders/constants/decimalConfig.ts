/**
 * Display decimal config for Limit Orders page
 * Default used is 6 decimals
 */
export const LIMIT_ORDER_DECIMAL_CONFIG = {
  btcb: 8,
} as const

export const getSymbolDecimals = (symbol: string | undefined) => {
  return symbol ? LIMIT_ORDER_DECIMAL_CONFIG[symbol.toLowerCase()] || 6 : 6
}
