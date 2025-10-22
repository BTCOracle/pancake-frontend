import BN from 'bn.js'
import Decimal from 'decimal.js'
import { ApiV3PoolInfoConcentratedItem, Price, toToken } from '@pancakeswap/solana-core-sdk'

export const convertPoolPrice = ({
  pool,
  price,
}: {
  pool: Pick<ApiV3PoolInfoConcentratedItem, 'mintA' | 'mintB'>
  price: string | number
}) => {
  const p = new Decimal(price ?? '0').clamp(
    1 / 10 ** Math.max(pool.mintA?.decimals ?? 0, pool.mintB?.decimals ?? 0, new Decimal(price).decimalPlaces()),
    Number.MAX_SAFE_INTEGER,
  )
  return new Price({
    baseToken: toToken(pool.mintA),
    denominator: new BN(10).pow(new BN(20 + pool.mintA!.decimals)),
    quoteToken: toToken(pool.mintB),
    numerator: p.mul(new Decimal(10 ** (20 + pool.mintB!.decimals))).toFixed(0),
  })
}
