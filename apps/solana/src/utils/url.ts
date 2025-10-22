export const isValidUrl = (url?: string) => {
  if (!url) return false
  try {
    /* eslint-disable no-new */
    new URL(url)
    return true
  } catch {
    return false
  }
}
