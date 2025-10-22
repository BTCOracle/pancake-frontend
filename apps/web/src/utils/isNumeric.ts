export function isNumeric(value: any) {
  // Copy from viem/utils/unit/parseUnits.ts
  return /^(-?)([0-9]*)\.?([0-9]*)$/.test(value)
}
