import React, { useCallback } from 'react'
import { useSwapContext } from 'src/contexts/SwapContext'
import RefreshSVG from 'src/icons/RefreshSVG'
import { useAccounts } from 'src/contexts/accounts'

const Header: React.FC<{ setIsWalletModalOpen(toggle: boolean): void }> = ({ setIsWalletModalOpen }) => {
  const { form, refresh } = useSwapContext()
  const { refresh: refreshAccounts } = useAccounts()

  const onRefresh = useCallback(() => {
    refreshAccounts()
    refresh()
  }, [refreshAccounts, refresh])

  return (
    <div className="mt-2 h-7 pl-3 pr-2">
      <div className="w-full flex items-center justify-between ">
        <span className="text-sm font-bold">Swap</span>
        <div className="flex space-x-1 items-center">
          <button
            type="button"
            className="p-2 h-7 w-7 flex items-center justify-center border rounded-full pcs-refresh-btn"
            onClick={onRefresh}
          >
            <RefreshSVG />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header
