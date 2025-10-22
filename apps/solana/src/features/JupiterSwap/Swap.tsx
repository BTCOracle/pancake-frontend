import '@pancakeswap/jupiter-terminal/global.css'
import '@pancakeswap/jupiter-terminal/index.css'

import { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { init, syncProps } from '@pancakeswap/jupiter-terminal'
import { AtomBox } from '@pancakeswap/uikit'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { TARGET_ELE_ID, TerminalCard, TerminalWrapper } from '@/features/JupiterSwap/SwapForm'
import useResponsive from '@/hooks/useResponsive'
import { colors } from '@/theme/cssVariables'
import { logGTMSwapTXSuccessEvent, logGTMWalletConnectedEvent } from '@/utils/report/curstomGTMEventTracking'
import { logDDSwapTXSuccessEvent, logDDWalletConnectedEvent } from '@/utils/report/datadog'
import { useRouteQuery } from '@/utils/routeTools'
import { useAppStore } from '../../store/useAppStore'

const SwapPage = styled(AtomBox)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
  padding-bottom: 0;
  background: ${colors.gradientBubblegum};
  background-size: auto;
`

const JupiterTerminal = () => {
  const { isMobile } = useResponsive()
  const { connection } = useConnection()
  const rpcNodeUrl = useAppStore((s) => s.rpcNodeUrl)
  const passthroughWalletContextState = useWallet()
  const { setVisible } = useWalletModal()
  const query = useRouteQuery<{ inputMint?: string; outputMint?: string }>()

  useEffect(() => {
    if (passthroughWalletContextState.wallet?.adapter.connected) {
      const walletName = passthroughWalletContextState.wallet?.adapter.name
      logGTMWalletConnectedEvent(walletName)
      logDDWalletConnectedEvent(walletName)
    }
  }, [passthroughWalletContextState.wallet?.adapter.connected, passthroughWalletContextState.wallet?.adapter.name])

  const logSwapSucc = useCallback(
    ({ txid }: { txid: string }) => {
      const info = {
        txId: txid,
        from: passthroughWalletContextState.wallet?.adapter.publicKey?.toBase58(),
        chain: 'solana'
      }
      // GTM
      logGTMSwapTXSuccessEvent(info)
      // DD
      logDDSwapTXSuccessEvent(info)
    },
    [passthroughWalletContextState.wallet?.adapter.publicKey]
  )

  useEffect(() => {
    const formProps: any = {}
    if (query.inputMint) formProps.initialInputMint = query.inputMint
    if (query.outputMint) formProps.initialOutputMint = query.outputMint
    init({
      displayMode: 'integrated',
      integratedTargetId: TARGET_ELE_ID,
      endpoint: rpcNodeUrl ?? process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT,
      refetchIntervalForTokenAccounts: 60000,
      containerStyles: {
        maxWidth: '480px',
        overflow: 'hidden',
        zIndex: 18
      },
      enableWalletPassthrough: true,
      onRequestConnectWallet: () => setVisible(true),
      onSuccess(result) {
        logSwapSucc(result)
      },
      ...(Object.keys(formProps).length ? { formProps } : {})
    })
  }, [setVisible, logSwapSucc, connection.rpcEndpoint, query.inputMint, query.outputMint])

  // Do not pass the passthroughWalletContextState into init.
  // Otherwise, the entire widget will refresh when the theme switches.
  useEffect(() => {
    syncProps({
      enableWalletPassthrough: true,
      passthroughWalletContextState
    })
  }, [passthroughWalletContextState])

  return (
    <SwapPage justifyContent={['flex-start', 'center']}>
      <TerminalWrapper style={{ marginTop: isMobile ? '24px' : '-70px' }}>
        <TerminalCard>
          <div id={TARGET_ELE_ID} />
        </TerminalCard>
      </TerminalWrapper>
    </SwapPage>
  )
}

export default JupiterTerminal
