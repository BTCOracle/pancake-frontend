const safeGetWindow: () => typeof window | undefined = () => {
  try {
    return typeof window !== 'undefined' ? window : undefined
  } catch (error) {
    console.error('Error accessing window:', error)
    return undefined
  }
}
export default safeGetWindow
