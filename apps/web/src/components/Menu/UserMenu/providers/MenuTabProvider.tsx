import { createContext, ReactNode, useContext, useState } from 'react'

export enum WalletView {
  WALLET_INFO,
  TRANSACTIONS,
  GIFTS,
  WRONG_NETWORK,
}

interface MenuTabContextType {
  view: WalletView
  setView: (view: WalletView) => void
}

const MenuTabContext = createContext<MenuTabContextType | undefined>(undefined)

interface MenuTabProviderProps {
  children: ReactNode
  initialView?: WalletView
}

export const MenuTabProvider: React.FC<MenuTabProviderProps> = ({ children, initialView = WalletView.WALLET_INFO }) => {
  const [view, setView] = useState<WalletView>(initialView)

  const value = {
    view,
    setView,
  }

  return <MenuTabContext.Provider value={value}>{children}</MenuTabContext.Provider>
}

export const useMenuTab = (): MenuTabContextType => {
  const context = useContext(MenuTabContext)
  if (context === undefined) {
    throw new Error('useMenuTab must be used within a MenuTabProvider')
  }

  return context
}
