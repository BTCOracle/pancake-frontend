import { PRECISION, SCALE_OFFSET } from '../../constants'

export const convertDecimalPriceTo128x128 = (price: bigint) => {
  // eslint-disable-next-line no-bitwise
  return (price << SCALE_OFFSET) / PRECISION
}

export const convert128x128ToDecimalPrice = (price: bigint) => {
  // eslint-disable-next-line no-bitwise
  return (price * PRECISION) >> SCALE_OFFSET
}
