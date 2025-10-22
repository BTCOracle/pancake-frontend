import { INFI_FARMING_DISTRIBUTOR_ADDRESSES, encodeClaimCalldata } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { ToastDescriptionWithTx } from 'components/Toast'
import { useMerkleTreeRootFromDistributor } from 'hooks/infinity/useDistributor'
import { useUserAllFarmRewardsByChainIdFromAPI } from 'hooks/infinity/useFarmReward'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { calculateGasMargin } from 'utils'
import { publicClient } from 'utils/viem'
import { type TransactionReceipt } from 'viem'
import { useAccount, useSendTransaction, useWalletClient } from 'wagmi'

import { useCheckShouldSwitchNetwork } from './useCheckShouldSwitchNetwork'

interface FarmInfinityActionReturnType {
  hasRewards: boolean
  hasUnclaimedRewards: boolean
  isMerkleRootMismatch: boolean
  attemptingTx: boolean
  onHarvest: () => Promise<void>
}

const useFarmInfinityActions = ({
  chainId,
  onDone,
}: {
  chainId: number
  onDone?: (resp: TransactionReceipt | null) => void
}): FarmInfinityActionReturnType => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { address: account } = useAccount()
  const { data: signer } = useWalletClient()
  const { sendTransactionAsync } = useSendTransaction()
  const queryClient = useQueryClient()
  const client = publicClient({ chainId })
  const [timestamp, setTimestamp] = useState<number | undefined>()

  const { loading, fetchWithCatchTxError } = useCatchTxError()
  const [, setLatestTxReceipt] = useLatestTxReceipt()
  const { switchNetworkIfNecessary, isLoading: isSwitchingNetwork } = useCheckShouldSwitchNetwork()

  const { allRewards, totalUnclaimedRewards } = useUserAllFarmRewardsByChainIdFromAPI({
    chainId,
    user: account,
    timestamp,
  })
  const merkleTreeRootFromDistributor = useMerkleTreeRootFromDistributor(chainId)
  const merkleRootMismatch = useMemo(
    () =>
      merkleTreeRootFromDistributor
        ? allRewards?.find((r) => r.merkleRoot !== merkleTreeRootFromDistributor)
        : undefined,
    [allRewards, merkleTreeRootFromDistributor],
  )

  useEffect(() => {
    if (timestamp || !merkleTreeRootFromDistributor || !merkleRootMismatch) {
      return
    }
    setTimestamp(Number(merkleRootMismatch.epochEndTimestamp) - 1)
  }, [merkleTreeRootFromDistributor, timestamp, merkleRootMismatch])

  const onHarvest = useCallback(async () => {
    if (!account || !allRewards) return
    const canClaim = totalUnclaimedRewards.find((reward) => new BigNumber(reward.totalReward).isGreaterThan(0))
    if (!canClaim) {
      return
    }
    const shouldSwitch = await switchNetworkIfNecessary(chainId)
    if (shouldSwitch) {
      return
    }
    const claimParams = allRewards.map(({ totalRewardAmount, rewardTokenAddress, proofs }) => ({
      proof: proofs,
      amount: BigInt(totalRewardAmount),
      token: rewardTokenAddress,
    }))
    const calldata = encodeClaimCalldata(claimParams)
    const txn = {
      to: INFI_FARMING_DISTRIBUTOR_ADDRESSES[chainId],
      data: calldata,
      value: 0n,
    }

    const receipt = await fetchWithCatchTxError(() =>
      client
        .estimateGas({
          account,
          ...txn,
        })
        .then((estimate) => {
          const newTxn = {
            ...txn,
            account,
            chain: signer?.chain,
            gas: calculateGasMargin(estimate),
          }

          return sendTransactionAsync(newTxn)
        }),
    )
    if (receipt?.status === 'success') {
      setLatestTxReceipt({ blockHash: receipt.blockHash, status: receipt.status })
      onDone?.(receipt)
      toastSuccess(
        `${t('Harvested')}!`,
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('Your %symbol% earnings have been sent to your wallet!', { symbol: 'CAKE' })}
        </ToastDescriptionWithTx>,
      )
      queryClient.invalidateQueries({ queryKey: ['mcv4-harvest'] })
    }
  }, [
    setLatestTxReceipt,
    totalUnclaimedRewards,
    chainId,
    allRewards,
    onDone,
    account,
    fetchWithCatchTxError,
    client,
    sendTransactionAsync,
    signer,
    t,
    toastSuccess,
    queryClient,
    switchNetworkIfNecessary,
  ])

  return {
    hasRewards: Boolean(allRewards?.length),
    hasUnclaimedRewards: totalUnclaimedRewards?.some((r) => Number(r.totalReward) > 0),
    isMerkleRootMismatch: Boolean(merkleRootMismatch),
    attemptingTx: loading || isSwitchingNetwork,
    onHarvest,
  }
}

export default useFarmInfinityActions
