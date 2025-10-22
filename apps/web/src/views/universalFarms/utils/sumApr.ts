export const sumApr = (...aprs: Array<number | `${number}` | undefined>): number => {
  const sum = aprs.reduce<number>((acc, apr) => {
    if (typeof apr === 'undefined') {
      return acc ?? 0
    }
    const x = Number(apr ?? 0)
    if (!Number.isFinite(x) || Number.isNaN(x)) {
      return acc
    }

    return acc + x
  }, 0)
  return Number(sum) ? Number(sum) : 0
}
