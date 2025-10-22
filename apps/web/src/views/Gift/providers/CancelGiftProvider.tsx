import { createContext, useState } from 'react'

export const CancelGiftContext = createContext({
  codeHash: '',
  setCodeHash: (_codeHash: string) => {},
})

export const CancelGiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [codeHash, setCodeHash] = useState('')
  return <CancelGiftContext.Provider value={{ codeHash, setCodeHash }}>{children}</CancelGiftContext.Provider>
}
