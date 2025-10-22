import { isEvm } from '@pancakeswap/chains'
import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'

import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'

export const useActiveChainId = (checkChainId?: number) => {
  const { isNotMatched, isWrongNetwork, chainId } = useAccountActiveChain()
  return {
    chainId,
    isNotMatched,
    isWrongNetwork: checkChainId ? isWrongNetwork && checkChainId !== chainId : isWrongNetwork,
  }
}

export const useActiveChainIdRef = () => {
  const { chainId } = useAccountActiveChain()

  const ref = useRef(chainId)
  useEffect(() => {
    ref.current = chainId
  }, [chainId])
  return ref
}

export const useAccountActiveChain = () => {
  const result = useAtomValue(accountActiveChainAtom)
  const { chainId, account, solanaAccount } = result
  const unifiedAccount = isEvm(chainId) ? account : solanaAccount
  return { ...result, unifiedAccount }
}

export default useAccountActiveChain
