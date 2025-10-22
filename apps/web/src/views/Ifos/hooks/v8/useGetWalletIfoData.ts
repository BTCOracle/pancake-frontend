import { Ifo, PoolIds } from '@pancakeswap/ifos'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useERC20, useIfoV8Contract } from 'hooks/useContract'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

import { useAppDispatch } from 'state'
import { fetchCakeVaultUserData } from 'state/pools'
import { WalletIfoData, WalletIfoState } from '../../types'
import useIfoAllowance from '../useIfoAllowance'
import { useIfoCredit } from '../useIfoCredit'
import { useIfoSourceChain } from '../useIfoSourceChain'
import { fetchIfoData } from './fetchIfoData'

const initialState = {
  isInitialized: false,
  poolBasic: {
    amountTokenCommittedInLP: BIG_ZERO,
    offeringAmountInToken: BIG_ZERO,
    refundingAmountInLP: BIG_ZERO,
    taxAmountInLP: BIG_ZERO,
    hasClaimed: false,
    isPendingTx: false,
    vestingReleased: BIG_ZERO,
    vestingAmountTotal: BIG_ZERO,
    isVestingInitialized: false,
    vestingId: '0',
    vestingComputeReleasableAmount: BIG_ZERO,
    isQualifiedNFT: false,
    isQualifiedPoints: false,
  },
  poolUnlimited: {
    amountTokenCommittedInLP: BIG_ZERO,
    offeringAmountInToken: BIG_ZERO,
    refundingAmountInLP: BIG_ZERO,
    taxAmountInLP: BIG_ZERO,
    hasClaimed: false,
    isPendingTx: false,
    vestingReleased: BIG_ZERO,
    vestingAmountTotal: BIG_ZERO,
    isVestingInitialized: false,
    vestingId: '0',
    vestingComputeReleasableAmount: BIG_ZERO,
  },
}

const useGetWalletIfoData = (ifo: Ifo): WalletIfoData => {
  const { chainId: currentChainId } = useActiveChainId()
  const [state, setState] = useState<WalletIfoState>(initialState)
  const dispatch = useAppDispatch()
  const { chainId, version, address } = ifo
  const creditAmount = useIfoCredit({ chainId, ifoAddress: ifo.address })
  const credit = useMemo(
    () => (creditAmount && new BigNumber(creditAmount.quotient.toString())) ?? BIG_ZERO,
    [creditAmount],
  )
  const sourceChain = useIfoSourceChain(chainId)

  const { address: account } = useAccount()

  const contract = useIfoV8Contract(ifo.address, { chainId })
  const currencyContract = useERC20(ifo.currency.address, { chainId })
  const allowance = useIfoAllowance(currencyContract, ifo.address)

  const setPendingTx = (status: boolean, poolId: PoolIds) =>
    setState((prevState) => ({
      ...prevState,
      [poolId]: {
        ...prevState[poolId],
        isPendingTx: status,
      },
    }))

  const setIsClaimed = (poolId: PoolIds) => {
    setState((prevState) => ({
      ...prevState,
      [poolId]: {
        ...prevState[poolId],
        hasClaimed: true,
      },
    }))
  }

  const resetIfoData = useCallback(() => {
    setState({ ...initialState })
  }, [])

  const creditLeftWithNegative = credit.minus(state.poolUnlimited.amountTokenCommittedInLP)

  const ifoCredit = {
    credit,
    creditLeft: BigNumber.maximum(BIG_ZERO, creditLeftWithNegative),
  }

  useEffect(() => {
    if (account) {
      fetchIfoData(account, ifo, ifo.version, chainId).then(({ basicPoolData, unlimitedPoolData }) => {
        setState((prevState) => ({
          ...prevState,
          isInitialized: true,
          poolBasic: { ...prevState.poolBasic, ...basicPoolData },
          poolUnlimited: { ...prevState.poolUnlimited, ...unlimitedPoolData },
        }))
      })
    }
  }, [account, chainId, dispatch, ifo, sourceChain])

  useEffect(() => {
    resetIfoData()
  }, [currentChainId, account, resetIfoData])
  const fetch = useCallback(async () => {
    if (!account) {
      return
    }
    const data = await fetchIfoData(account, ifo, version, chainId)
    dispatch(fetchCakeVaultUserData({ account, chainId: sourceChain }))
    setState((prevState) => ({
      ...prevState,
      isInitialized: true,
      poolBasic: { ...prevState.poolBasic, ...data.basicPoolData },
      poolUnlimited: { ...prevState.poolUnlimited, ...data.unlimitedPoolData },
    }))
  }, [account, address, dispatch, version, chainId, sourceChain])

  return {
    ...state,
    allowance,
    contract,
    setPendingTx,
    setIsClaimed,
    resetIfoData,
    fetchIfoData: fetch,
    ifoCredit,
    version: 8,
  }
}

export default useGetWalletIfoData
