import { ReactNode } from 'react'

const transRegex = /(%[^%]+%)/

export function Trans({ text, data = {} }: { text: string; data?: { [key: string]: ReactNode } }) {
  const parts = text.split(transRegex)
  return parts.map((p) => {
    if (!transRegex.test(p)) {
      return p
    }
    const key = p.replace(/%/g, '')
    return data[key] || p
  })
}
