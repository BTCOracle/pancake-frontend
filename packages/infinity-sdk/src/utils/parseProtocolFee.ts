import { Percent } from '@pancakeswap/swap-sdk-core'

const FEE_BASE = 10n ** 4n

export function parseProtocolFees(feeProtocol?: number | string): [Percent, Percent] | undefined {
  const fees = parseProtocolFeesToNumbers(feeProtocol)
  if (!fees) return undefined
  const [token0ProtocolFee, token1ProtocolFee] = fees
  return [new Percent(token0ProtocolFee, FEE_BASE), new Percent(token1ProtocolFee, FEE_BASE)]
}

export function parseProtocolFeesToNumbers(feeProtocol?: number | string): [number, number] | undefined {
  if (feeProtocol === undefined) {
    return undefined
  }
  const packed = Number(feeProtocol)
  if (Number.isNaN(packed)) {
    throw new Error(`Invalid fee protocol ${feeProtocol}`)
  }

  const token0ProtocolFee = packed % 2 ** 12
  // eslint-disable-next-line no-bitwise
  const token1ProtocolFee = packed >> 12
  return [token0ProtocolFee, token1ProtocolFee]
}
