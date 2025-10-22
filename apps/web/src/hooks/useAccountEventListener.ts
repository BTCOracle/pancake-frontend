import { watchAccount } from '@wagmi/core'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAppDispatch } from 'state'
import { clearUserStates } from 'utils/clearUserStates'
import { useAccount, useAccountEffect, useConfig } from 'wagmi'

export const useChainIdListener = () => {
  const switchedNetworkRef = useRef<number>()
  const { chainId: oldChainId } = useAccount()
  const onChainChanged = useCallback(
    ({ chainId }: { chainId?: number }) => {
      if (chainId === undefined) return
      if (oldChainId === chainId) return
      if (chainId === switchedNetworkRef.current) return
      switchedNetworkRef.current = undefined
    },
    [oldChainId],
  )

  const handleSwitchNetwork = useCallback((e: Event) => {
    const switchNetworkEvent = e as CustomEvent<{
      newChainId: number
    }>
    // Mark network switched via useSwitchNetwork to skip switchNetworkCallback
    switchedNetworkRef.current = switchNetworkEvent.detail.newChainId
  }, [])

  const { connector } = useAccount()

  useEffect(() => {
    connector?.emitter?.on('change', onChainChanged)
    if (typeof window !== 'undefined') {
      window.addEventListener('switchNetwork#pcs', handleSwitchNetwork)
    }

    return () => {
      connector?.emitter?.off('change', onChainChanged)
      if (typeof window !== 'undefined') {
        window.removeEventListener('switchNetwork#pcs', handleSwitchNetwork)
      }
    }
  }, [connector, onChainChanged, oldChainId, handleSwitchNetwork])
}

const useAddressListener = () => {
  const config = useConfig()
  const dispatch = useAppDispatch()
  const { chainId } = useAccount()

  useEffect(() => {
    return watchAccount(config as any, {
      onChange(data, prevData) {
        if (prevData.status === 'connected' && data.status === 'connected' && prevData.chainId === data.chainId) {
          clearUserStates(dispatch, { chainId })
        }
      },
    })
  }, [config, dispatch, chainId])
}

export const useAccountEventListener = () => {
  const dispatch = useAppDispatch()
  const { chainId } = useAccount()
  useChainIdListener()
  useAddressListener()

  useAccountEffect(
    useMemo(
      () => ({
        onDisconnect() {
          clearUserStates(dispatch, { chainId })
        },
      }),
      [chainId, dispatch],
    ),
  )
}
