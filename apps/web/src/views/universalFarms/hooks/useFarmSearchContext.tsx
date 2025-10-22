import { createContext, useContext } from 'react'

const FarmSearchContext = createContext({
  enabled: false,
})

export const useIsFarmSearchContext = () => {
  const context = useContext(FarmSearchContext)
  if (!context) {
    throw new Error('useFarmSearchContext must be used within a FarmSearchProvider')
  }
  return context.enabled
}

export const FarmSearchContextProvider = ({ children }: { children: React.ReactNode }) => {
  return <FarmSearchContext.Provider value={{ enabled: true }}>{children}</FarmSearchContext.Provider>
}
