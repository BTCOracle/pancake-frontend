export const getBurnInfoPrecision = (value: number) => {
  // if value is greater than 100 million but less than a billion, return 0
  if (value >= 100_000_000 && value <= 1_000_000_000) {
    return 0
  }

  return undefined
}
