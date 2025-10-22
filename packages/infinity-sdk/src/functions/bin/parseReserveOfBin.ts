import { decodeBinAmount } from './decodeBinAmount'

export const parseReserveOfBin = (
  liquidities: Array<{
    binId: string | number
    liquidity: bigint | string
    [key: string]: unknown
  }>
) => {
  return liquidities.reduce(
    (acc, { binId: _binId, liquidity: _liquidity }) => {
      try {
        const binId = Number(BigInt(_binId))
        const liquidity = BigInt(_liquidity)
        const { amountX, amountY } = decodeBinAmount(liquidity)

        acc.push({
          binId,
          liquidity,
          reserveX: amountX,
          reserveY: amountY,
        })
        return acc
      } catch (error) {
        return acc
      }
    },
    [] as Array<{
      binId: number
      liquidity: bigint
      reserveX: bigint
      reserveY: bigint
    }>
  )
}
