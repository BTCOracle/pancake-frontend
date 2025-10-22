export const formatNumber = (num: number): string => {
  if (num >= 1e9) return norm(`${(num / 1e9).toFixed(1)}B+`)
  if (num >= 1e6) return norm(`${(num / 1e6).toFixed(1)}M+`)
  return norm(num.toString())
}

function norm(str: string) {
  return str.replace('.0', '')
}
