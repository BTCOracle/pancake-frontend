import { parseProtocolFeesToNumbers } from '@pancakeswap/infinity-sdk'

export function getInfinityPoolFee(fee: number, protocolFee?: number) {
  const pf = parseProtocolFeesToNumbers(protocolFee)
  return fee + (pf?.[0] ?? 0)
}
