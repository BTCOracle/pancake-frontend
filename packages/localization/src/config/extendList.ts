import list from './translation.extend.json'

export const extendEnList: Record<string, string> = Object.keys(list).reduce((acc, key) => {
  // eslint-disable-next-line no-param-reassign
  acc[key] = (list as any)[key]!.value
  return acc
}, {} as Record<string, string>)
