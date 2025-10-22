export const calculateBridgeFeeAmount = (fee: string, decimals: number) => {
  const numericFee = Number(fee)

  // Return 0 for any invalid cases (NaN, Infinity, negative decimals)
  if (Number.isNaN(numericFee) || !Number.isFinite(numericFee) || decimals < 0) {
    return 0
  }

  const result = Math.abs(numericFee) * 10 ** decimals

  // Return 0 if result is not finite
  if (!Number.isFinite(result)) {
    return 0
  }

  return Math.floor(result)
}
