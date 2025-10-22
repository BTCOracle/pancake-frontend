import { createContext, useContext } from 'react'

const W3WConfigContext = createContext<boolean | undefined>(undefined)

export const useW3WConfig = () => {
  const context = useContext(W3WConfigContext)
  if (context === undefined) {
    throw new Error('useW3WConfig must be used within a W3WConfigProvider')
  }
  return context
}

export const W3WConfigProvider: React.FC<{ value: boolean | undefined; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  return <W3WConfigContext.Provider value={Boolean(value)}>{children}</W3WConfigContext.Provider>
}
