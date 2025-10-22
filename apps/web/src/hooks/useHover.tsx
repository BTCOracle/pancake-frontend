import { cloneElement, createContext, ReactNode, useContext, useEffect, useState } from 'react'

export function useHover<T>(): [(value: T) => void, boolean] {
  const [value, setValue] = useState<boolean>(false)
  const [ref, setRef] = useState<T | null>(null)

  useEffect(() => {
    const node = ref as any
    if (node) {
      node.addEventListener('mouseover', () => setValue(true))
      node.addEventListener('mouseout', () => setValue(false))
      return () => {
        node.removeEventListener('mouseover', () => setValue(false))
        node.removeEventListener('mouseout', () => setValue(true))
      }
    }
    return undefined
  }, [ref])
  return [setRef, value]
}

const HoverContext = createContext({
  isHover: false,
})
export const useHoverContext = () => {
  const ctx = useContext(HoverContext)
  return Boolean(ctx.isHover)
}

type HoverNode = React.ReactNode | ((ref: any) => ReactNode)
export const HoverProvider = ({ children }: { children: HoverNode }) => {
  const [ref, isHover] = useHover()

  const child = typeof children === 'function' ? (children as any)(ref) : children
  return <HoverContext.Provider value={{ isHover }}>{cloneElement(child as any, { ref })}</HoverContext.Provider>
}
