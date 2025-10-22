import { useEffect, useRef } from 'react'

export const useValueChanged = (callback: () => void, deps: any[]) => {
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else {
      callback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
