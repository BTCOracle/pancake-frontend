import { CurrencyAmount, Price, type Currency } from '@pancakeswap/swap-sdk-core'
import type { Address } from 'viem'
import type { PoolInfo } from '../../ifov2.types'

export type RawPoolInfo = readonly [bigint, bigint, bigint, boolean, bigint, bigint]

const TAX_PRECISION = 10000000000n

interface MapToPoolInfoArgs {
  raw: RawPoolInfo
  pid: number
  poolToken: Address
  stakeCurrency?: Currency
  offeringCurrency?: Currency
  feeTier?: number
}

export const mapToPoolInfo = ({
  raw,
  pid,
  poolToken,
  stakeCurrency,
  offeringCurrency,
  feeTier,
}: MapToPoolInfoArgs): PoolInfo | undefined => {
  const [raisingAmountPool, offeringAmountPool, capPerUserInLP, hasTax, totalAmountPool, sumTaxesOverflow] = raw

  if (offeringAmountPool <= 0n) return undefined

  const overflow = totalAmountPool > raisingAmountPool ? totalAmountPool - raisingAmountPool : 0n
  const flatTaxRate = overflow > 0n ? (sumTaxesOverflow * TAX_PRECISION) / overflow : 0n

  return {
    pid,
    poolToken,
    raisingAmountPool,
    offeringAmountPool,
    capPerUserInLP,
    hasTax,
    totalAmountPool,
    sumTaxesOverflow,
    flatTaxRate,
    feeTier: feeTier ?? 0,
    stakeCurrency,
    price:
      stakeCurrency && offeringCurrency
        ? new Price(offeringCurrency, stakeCurrency, offeringAmountPool, raisingAmountPool)
        : undefined,
    raise: stakeCurrency ? CurrencyAmount.fromRawAmount(stakeCurrency, raisingAmountPool) : undefined,
    saleAmount: offeringCurrency ? CurrencyAmount.fromRawAmount(offeringCurrency, offeringAmountPool) : undefined,
  }
}
