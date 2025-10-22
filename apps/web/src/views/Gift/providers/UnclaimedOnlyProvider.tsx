import { ReactNode, createContext, useContext, useState } from 'react'

interface UnclaimedOnlyContextType {
  unclaimedOnly: boolean
  setUnclaimedOnly: (value: boolean) => void
}

const UnclaimedOnlyContext = createContext<UnclaimedOnlyContextType | undefined>(undefined)

export const useUnclaimedOnlyContext = () => {
  const context = useContext(UnclaimedOnlyContext)
  if (!context) {
    throw new Error('useUnclaimedOnlyContext must be used within an UnclaimedOnlyProvider')
  }
  return context
}

export const UnclaimedOnlyProvider = ({ children }: { children: ReactNode }) => {
  const [unclaimedOnly, setUnclaimedOnly] = useState(false)

  return (
    <UnclaimedOnlyContext.Provider value={{ unclaimedOnly, setUnclaimedOnly }}>
      {children}
    </UnclaimedOnlyContext.Provider>
  )
}
