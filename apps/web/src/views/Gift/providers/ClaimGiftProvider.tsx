import { createContext, useContext, useState } from 'react'

export const ClaimGiftContext = createContext({
  code: '',
  setCode: (_code: string) => {},
})

export const useClaimGiftContext = () => {
  const context = useContext(ClaimGiftContext)
  if (!context) {
    throw new Error('useClaimGift must be used within a ClaimGiftProvider')
  }
  return context
}

export const ClaimGiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [code, setCode] = useState('')

  return <ClaimGiftContext.Provider value={{ code, setCode }}>{children}</ClaimGiftContext.Provider>
}
