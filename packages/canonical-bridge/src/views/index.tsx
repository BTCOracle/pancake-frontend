import { useTranslation } from '@pancakeswap/localization'
import { Flex, useToast } from '@pancakeswap/uikit'
import { useCallback, useMemo } from 'react'

import {
  BridgeRoutes,
  BridgeTransfer,
  CanonicalBridgeProvider,
  EventData,
  EventName,
  IChainConfig,
  ICustomizedBridgeConfig,
  createGTMEventListener,
  IBridgeConfig,
  EventTypes,
} from '@bnb-chain/canonical-bridge-widget'
import { allCasesNameToChainId } from '@pancakeswap/chains'
import { useTheme } from 'styled-components'
import { useAccount } from 'wagmi'
import { RefreshingIcon } from '../components/RefreshingIcon'
import { V1BridgeLink } from '../components/V1BridgeLink'
import { chains, env } from '../configs'
import { useTransferConfig } from '../hooks/useTransferConfig'
import { locales } from '../modules/i18n/locales'
import { breakpoints } from '../theme/breakpoints'
import { dark } from '../theme/dark'
import { light } from '../theme/light'
import GlobalStyle from './GlobalStyle'
import { useDisableToChains } from '../hooks/useDisableToChains'
import { useChainFromWidget } from '../hooks/useChainFromWidget'
import { SmartWalletWarning } from '../components/SmartWalletWarning'
import { useInputDecimalValidation } from '../hooks/useInputDecimalValidation'

export interface CanonicalBridgeProps {
  connectWalletButtons: {
    default: IBridgeConfig['components']['connectWalletButton']
  } & {
    [key: string]: IBridgeConfig['components']['connectWalletButton']
  }
  supportedChainIds: number[]
  rpcConfig: Record<number, readonly string[]>
  disabledToChains?: number[]
  deBridgeAccessToken?: string
}

const gtmListener = createGTMEventListener()

export const CanonicalBridge = (props: CanonicalBridgeProps) => {
  const { connectWalletButtons, supportedChainIds, disabledToChains, rpcConfig, deBridgeAccessToken } = props
  useDisableToChains(disabledToChains)
  useInputDecimalValidation()

  const { currentLanguage, t } = useTranslation()
  const fromChain = useChainFromWidget('from')
  const toChain = useChainFromWidget('to')
  const theme = useTheme()
  const toast = useToast()
  const { connector } = useAccount()
  const supportedChains = useMemo<IChainConfig[]>(() => {
    return (
      chains
        // enable Solana
        .filter((e) => [...supportedChainIds, 7565164].includes(e.id))
        .filter((e) => !(connector?.id === 'BinanceW3WSDK' && e.id === 1101))
        .filter((e) => e.id !== 1101 && e.id !== 1442) // Disable zkevm for sunsetting
        .map((chain) => ({
          ...chain,
          rpcUrls: { default: { http: rpcConfig?.[chain.id] ?? chain.rpcUrls.default.http } },
        }))
    )
  }, [supportedChainIds, connector?.id, rpcConfig])
  const transferConfig = useTransferConfig(supportedChains)
  const handleError = useCallback(
    (params: { type: string; message?: string | undefined; error?: Error | undefined }) => {
      if (params.message) {
        toast.toastError(params.message)
      }
    },
    [toast],
  )

  const config = useMemo<ICustomizedBridgeConfig>(
    () => ({
      appName: 'canonical-bridge',
      assetPrefix: env.ASSET_PREFIX,
      bridgeTitle: t('Bridge'),
      theme: {
        colorMode: theme.isDark ? 'dark' : 'light',
        breakpoints,
        colors: {
          dark,
          light,
        },
      },
      locale: {
        language: currentLanguage.code,
        messages: locales[currentLanguage.code] ?? locales.en,
      },
      http: {
        apiTimeOut: 30 * 1000,
        serverEndpoint: env.SERVER_ENDPOINT,
        deBridgeReferralCode: '31958',
        deBridgeAccessToken,
      },
      transfer: transferConfig,
      components: {
        connectWalletButton: (fromChain && connectWalletButtons[fromChain]) ?? connectWalletButtons.default,
        refreshingIcon: <RefreshingIcon />,
      },

      analytics: {
        enabled: true,
        onEvent: (eventName: EventName, eventData: EventData<any>) => {
          if (
            eventName === EventTypes.SELECT_BRIDGE_FROM_DROPDOWN ||
            eventName === EventTypes.CLICK_BRIDGE_SWITCH_NETWORK
          ) {
            const networkName = eventName === EventTypes.SELECT_BRIDGE_FROM_DROPDOWN ? eventData?.fromNetwork : toChain

            if (networkName) {
              const matchedChainId = allCasesNameToChainId[networkName]

              if (matchedChainId) {
                const customPayload = {
                  network: networkName,
                  chainId: matchedChainId,
                }

                window.dispatchEvent(new CustomEvent('pcs_bridge_select_from_network', { detail: customPayload }))
              } else {
                console.warn(`No matching chain found for network name: ${networkName}`)
              }
            }
          }
          gtmListener(eventName, eventData)
        },
      },

      chains: supportedChains,
      onError: handleError,
    }),
    [
      currentLanguage.code,
      t,
      theme.isDark,
      transferConfig,
      supportedChains,
      handleError,
      fromChain,
      toChain,
      connectWalletButtons,
      deBridgeAccessToken,
    ],
  )

  return (
    <>
      <GlobalStyle />
      <CanonicalBridgeProvider config={config}>
        <Flex flexDirection="column" justifyContent="center" maxWidth="480px" width="100%">
          <BridgeTransfer />
          <SmartWalletWarning />
          <V1BridgeLink />
        </Flex>
        <BridgeRoutes />
      </CanonicalBridgeProvider>
    </>
  )
}
