import { setUser } from '@sentry/nextjs'
import { useEffect } from 'react'
import { useAccountActiveChain } from './useAccountActiveChain'

function useSentryUser() {
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  useEffect(() => {
    const user = {
      ...(evmAccount ? { account: evmAccount } : {}),
      ...(solanaAccount ? { solanaAccount } : {}),
    }

    if (Object.keys(user).length > 0) {
      setUser(user)
    }
  }, [evmAccount, solanaAccount])
}

export default useSentryUser
