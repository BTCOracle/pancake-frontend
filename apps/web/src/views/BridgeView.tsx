import { ChainId, chainNames, NonEVMChainId } from '@pancakeswap/chains'
import { Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { PUBLIC_NODES } from 'config/nodes'
import dynamic from 'next/dynamic'
import { Suspense, useEffect, useMemo } from 'react'
import { CHAIN_IDS } from 'utils/wagmi'
import Page from 'views/Page'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'

const DISABLED_TO_CHAINS: ChainId[] = []
// Dynamic import to avoid import trace warnings
const CanonicalBridge = dynamic(
  () => import('@pancakeswap/canonical-bridge').then((mod) => ({ default: mod.CanonicalBridge })),
  {
    ssr: false,
  },
)

// Fix portal conflicts between Privy and Chakra portals
function usePortalConflictFix() {
  useEffect(() => {
    const handlePortalConflict = () => {
      // Check for both portals existing
      const headlessuiPortals = document.querySelectorAll('[id*="headlessui-portal-root"]')
      const chakraPortals = document.querySelectorAll('[class*="chakra-portal"]')

      if (headlessuiPortals.length > 0 && chakraPortals.length > 0) {
        // Temporarily hide chakra portals when headlessui modal is active
        chakraPortals.forEach((portal) => {
          const portalElement = portal as HTMLElement
          portalElement.style.visibility = 'hidden'
        })

        // Restore visibility when headlessui portal is removed
        const observer = new MutationObserver(() => {
          const remainingHeadlessuiPortals = document.querySelectorAll('[id*="headlessui-portal-root"]')
          if (remainingHeadlessuiPortals.length === 0) {
            chakraPortals.forEach((portal) => {
              const portalElement = portal as HTMLElement
              portalElement.style.visibility = 'visible'
            })
          }
        })

        observer.observe(document.body, { childList: true, subtree: true })

        return () => observer.disconnect()
      }

      return undefined
    }

    // Monitor for portal creation
    const portalObserver = new MutationObserver(handlePortalConflict)
    portalObserver.observe(document.body, { childList: true, subtree: true })

    // Also check immediately
    handlePortalConflict()

    return () => {
      portalObserver.disconnect()
    }
  }, [])
}

const BridgeChainSync = () => {
  const { switchNetwork } = useSwitchNetwork()

  useEffect(() => {
    const handleNetworkSelect = async (event: Event) => {
      const customEvent = event as CustomEvent<{ network: string; chainId: number }>
      const { chainId } = customEvent.detail
      const result = await switchNetwork(chainId)
    }

    window.addEventListener('pcs_bridge_select_from_network', handleNetworkSelect)

    return () => {
      window.removeEventListener('pcs_bridge_select_from_network', handleNetworkSelect)
    }
  }, [])

  return null
}

export const BridgeView = () => {
  const { isMobile } = useMatchBreakpoints()

  // Fix portal conflicts on this page
  usePortalConflictFix()

  return (
    <Page removePadding hideFooterOnDesktop={false} showExternalLink={false} showHelpLink={false} noMinHeight>
      <Flex
        width="100%"
        height="100%"
        justifyContent="center"
        position="relative"
        px={isMobile ? '16px' : '24px'}
        pb={isMobile ? '14px' : '48px'}
        pt={isMobile ? '24px' : '64px'}
        alignItems="flex-start"
        max-width="unset"
      >
        <Suspense>
          <CanonicalBridge
            connectWalletButtons={useMemo(
              () => ({
                default: <ConnectWalletButton width="100%" />,
                [chainNames[NonEVMChainId.SOLANA]]: <ConnectWalletButton width="100%" />,
              }),
              [],
            )}
            supportedChainIds={[...CHAIN_IDS, 7565164]}
            rpcConfig={PUBLIC_NODES}
            disabledToChains={DISABLED_TO_CHAINS}
            deBridgeAccessToken={process.env.NEXT_PUBLIC_DEBRIDGE_ACCESS_TOKEN}
          />
        </Suspense>
      </Flex>
      <BridgeChainSync />
    </Page>
  )
}
