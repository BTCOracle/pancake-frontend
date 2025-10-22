import { Currency, getUnifiedCurrencyAddress, UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { subgraphTokenName, subgraphTokenSymbol } from 'state/info/constant'
import { safeGetAddress } from 'utils'

export const getTokenSymbolAlias = (
  address: string | undefined,
  chainId: number | undefined,
  defaultSymbol?: string,
): string | undefined => {
  const addr = safeGetAddress(address)
  if (!addr || !chainId) {
    return defaultSymbol
  }
  return subgraphTokenSymbol[chainId]?.[addr] ?? defaultSymbol
}

export const getTokenNameAlias = (
  address: string | undefined,
  chainId: number | undefined,
  defaultName?: string,
): string | undefined => {
  const addr = safeGetAddress(address)
  if (!addr || !chainId) {
    return defaultName
  }
  return subgraphTokenName[chainId]?.[addr] ?? defaultName
}

export const getCurrencySymbol = (currency: UnifiedCurrency) => {
  const address = getUnifiedCurrencyAddress(currency)
  const alias = getTokenSymbolAlias(address, currency.chainId, currency.symbol)
  if (alias) {
    return alias
  }
  return currency.symbol
}

export const getTokenAddressFromSymbolAlias = (
  alias: string | undefined,
  chainId: number | undefined,
  defaultValue: string,
): string => {
  if (!alias || !chainId) {
    return defaultValue
  }
  const address = Object.keys(subgraphTokenSymbol[chainId] ?? {}).find(
    (key) => subgraphTokenSymbol[chainId][key].toLowerCase() === alias.toLowerCase(),
  )
  return address ? safeGetAddress(address)! : defaultValue
}
