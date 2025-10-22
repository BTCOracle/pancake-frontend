import { ReactNode, createContext, useContext } from 'react'

const Context = createContext({
  isInfinity: false,
})

export const useInfinityContext = () => {
  const context = useContext(Context)
  return context
}

export const InfinityProvider = ({ children }: { children: ReactNode }) => {
  return <Context.Provider value={{ isInfinity: true }}>{children}</Context.Provider>
}
