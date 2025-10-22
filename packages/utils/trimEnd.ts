export default function trimEnd(str: string, chars?: string): string {
  if (!str) return str
  if (!chars) return str.replace(/\s+$/, '')

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`[${escapeRegExp(chars)}]+$`)
  return str.replace(pattern, '')
}
