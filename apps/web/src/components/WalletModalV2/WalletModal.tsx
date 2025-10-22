import { useTranslation } from '@pancakeswap/localization'
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  Box,
  Button,
  ButtonMenu,
  Card,
  CardBody,
  FlexGap,
  Modal,
  ModalHeader,
  ModalV2,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'

import { RecentTransactions } from 'components/App/Transactions/TransactionsModal'

import { useTheme } from '@pancakeswap/hooks'
import { useMenuTab, WalletView } from 'components/Menu/UserMenu/providers/MenuTabProvider'
import { StyledButtonMenuItem, TabsComponent } from 'components/Menu/UserMenu/WalletModal'
import { useMultichainAddressBalance } from 'hooks/useAddressBalance'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { formatAmount } from 'utils/formatInfoNumbers'
import { ClaimGiftConfirmView } from 'views/Gift/components/ClaimGiftConfirmView'
import { ClaimGiftView } from 'views/Gift/components/ClaimGiftView'
import { GiftInfoDetailView } from 'views/Gift/components/GiftInfoDetailView'
import { GiftsDashboard } from 'views/Gift/components/GiftsDashboard'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { CancelGiftProvider } from 'views/Gift/providers/CancelGiftProvider'
import { useAtomValue, useSetAtom } from 'jotai'
import { connectedWalletModalVisibleAtom } from 'state/wallet/atom'
import { useConnect } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { previouslyUsedEvmWalletsAtom } from '@pancakeswap/ui-wallets/src/state/atom'
import { walletsConfig } from 'config/wallet'
import { useClaimGiftContext } from 'views/Gift/providers/ClaimGiftProvider'
import { ActionButton } from './ActionButton'
import { AssetsList } from './AssetsList'
import { SendAssets } from './SendAssets'
import { SEND_ENTRY, ViewState } from './type'
import { useWalletModalV2ViewState } from './WalletModalV2ViewStateProvider'
import { ConnectedWalletsButton } from './ConnectedWalletsButton'
import { ConnectedWallets } from './ConnectedWallets'
import ReceiveOptionsView from './ReceiveOptionsView'
import { ReceiveContent } from './ReceiveModal'
import EmptyWalletActions from './EmptyWalletActions'

interface WalletModalProps {
  isOpen: boolean
  evmAccount?: string
  solanaAccount?: string
  onDismiss: () => void
  onReceiveClick: () => void
  onDisconnect: () => void
}

const StyledModal = styled(Modal)`
  width: 100%;
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
  ${ModalHeader} {
    display: none;
  }
`

const TotalBalanceInteger = styled(Text)`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const TotalBalanceDecimal = styled(Text)`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const ActionButtonsContainer = styled(FlexGap)`
  padding: 16px 0px;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 16px;
  }
`

const WalletModal: React.FC<WalletModalProps> = ({
  evmAccount,
  solanaAccount,
  onDismiss,
  isOpen,
  onReceiveClick,
  onDisconnect,
}) => {
  const { viewState } = useWalletModalV2ViewState()

  // If no account is provided, show a message or redirect
  if (!evmAccount && !solanaAccount && viewState !== ViewState.CLAIM_GIFT) {
    return null
  }
  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <StyledModal title={undefined} onDismiss={onDismiss} hideCloseButton bodyPadding="16px">
        <WalletContent
          evmAccount={evmAccount}
          solanaAccount={solanaAccount}
          onDisconnect={onDisconnect}
          onDismiss={onDismiss}
          onReceiveClick={onReceiveClick}
        />
      </StyledModal>
    </ModalV2>
  )
}

export const WalletContent = ({
  evmAccount,
  solanaAccount,
  onDismiss,
  onReceiveClick,
  onDisconnect,
}: {
  evmAccount: string | undefined
  solanaAccount: string | undefined
  onDismiss: () => void
  onReceiveClick: () => void
  onDisconnect: () => void
}) => {
  const { view, setView } = useMenuTab()
  const { t } = useTranslation()
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()
  const { viewState, setViewState, goBack, setSendEntry } = useWalletModalV2ViewState()
  const { setCode } = useClaimGiftContext()
  const { theme } = useTheme()
  const setConnectedWalletModalVisible = useSetAtom(connectedWalletModalVisibleAtom)

  const { chainId } = useActiveChainId()
  const [selectedReceiveAccount, setSelectedReceiveAccount] = useState<string | undefined>(undefined)
  const [selectedReceiveChain, setSelectedReceiveChain] = useState<'evm' | 'solana' | undefined>(undefined)
  const selectedWallet = useMemo(() => {
    if (selectedReceiveChain === 'evm') return evmAccount
    if (selectedReceiveChain === 'solana') return solanaAccount
    return undefined
  }, [selectedReceiveChain, evmAccount, solanaAccount])

  // Wallet connection hooks for getting icons
  const { connectAsync } = useConnect()
  const { wallet: solanaWallet } = useWallet()
  const previouslyUsedEvmWalletsId = useAtomValue(previouslyUsedEvmWalletsAtom)
  const walletConfig = walletsConfig({ chainId, connect: connectAsync })

  // Get selected wallet icon
  const selectedWalletIcon = useMemo(() => {
    if (selectedReceiveChain === 'solana') {
      return solanaWallet?.adapter.icon as string | undefined
    }
    if (selectedReceiveChain === 'evm') {
      const evmWallet = walletConfig.find((w) => w.id === previouslyUsedEvmWalletsId[0])
      return evmWallet?.icon as string | undefined
    }
    return undefined
  }, [selectedReceiveChain, solanaWallet, walletConfig, previouslyUsedEvmWalletsId])

  // Fetch balances using the hook we created
  const { balances, isLoading, totalBalanceUsd } = useMultichainAddressBalance()
  const balanceDisplay = useMemo(() => {
    const display = formatAmount(totalBalanceUsd)?.split('.')
    return {
      integer: display?.[0] || '',
      decimal: display?.[1] || '',
    }
  }, [totalBalanceUsd])

  const noAssets = (balances.length === 0 || totalBalanceUsd === 0) && !isLoading
  const handleClick = useCallback(
    (newIndex: number) => {
      setView(newIndex)
    },
    [setView],
  )

  const actionView = useMemo(() => {
    if (viewState === ViewState.GIFT_INFO_DETAIL) return <GiftInfoDetailView />

    // Receive Options
    if (viewState === ViewState.RECEIVE_OPTIONS) {
      return (
        <ReceiveOptionsView
          onSelectEVM={() => {
            setSelectedReceiveAccount(evmAccount)
            setSelectedReceiveChain('evm')
            setViewState(ViewState.RECEIVE_QR)
          }}
          onSelectSolana={() => {
            setSelectedReceiveAccount(solanaAccount ?? undefined)
            setSelectedReceiveChain('solana')
            setViewState(ViewState.RECEIVE_QR)
          }}
          evmAccount={evmAccount}
          solanaAccount={solanaAccount ?? undefined}
        />
      )
    }

    // Receive QR
    if (viewState === ViewState.RECEIVE_QR) {
      return (
        <>
          <ButtonMenu
            scale="sm"
            variant="text"
            onItemClick={(index) =>
              index === 0 ? setViewState(ViewState.RECEIVE_QR) : setViewState(ViewState.CLAIM_GIFT)
            }
            activeIndex={viewState === ViewState.RECEIVE_QR ? 0 : 1}
          >
            <StyledButtonMenuItem>{t('Address')}</StyledButtonMenuItem>
            <StyledButtonMenuItem>{t('Claim Gift')}</StyledButtonMenuItem>
          </ButtonMenu>

          <ReceiveContent
            account={selectedReceiveAccount || ''}
            chainType={selectedReceiveChain}
            walletIcon={selectedWalletIcon}
          />
        </>
      )
    }

    // Claim Gift
    if ([ViewState.CLAIM_GIFT, ViewState.CLAIM_GIFT_CONFIRM].includes(viewState)) {
      return (
        <>
          {viewState === ViewState.CLAIM_GIFT ? (
            <ClaimGiftView setViewState={setViewState} />
          ) : (
            <ClaimGiftConfirmView />
          )}
        </>
      )
    }

    return (
      <SendAssets
        assets={balances}
        isLoading={isLoading}
        onViewStateChange={setViewState}
        viewState={viewState}
        onBack={goBack}
      />
    )
  }, [
    t,
    viewState,
    balances,
    isLoading,
    goBack,
    setViewState,
    evmAccount,
    solanaAccount,
    selectedReceiveAccount,
    selectedReceiveChain,
    selectedWalletIcon,
  ])

  if (viewState === ViewState.CONNECTED_WALLETS) {
    return (
      <Box
        minWidth={isMobile ? '100%' : '357px'}
        maxHeight={isMobile ? 'auto' : 'calc(100vh - 80px)'}
        maxWidth={isMobile ? '100%' : '377px'}
        overflowY={isMobile ? undefined : 'auto'}
        p="16px"
      >
        <ConnectedWallets onBack={goBack} solanaAddress={solanaAccount} evmAddress={evmAccount} />
      </Box>
    )
  }

  return (
    <Box
      minWidth={isMobile ? '100%' : '357px'}
      maxHeight={isMobile ? 'auto' : 'calc(100vh - 80px)'}
      maxWidth={isMobile ? '100%' : '377px'}
      overflowY={isMobile ? undefined : 'auto'}
    >
      {(evmAccount || solanaAccount) && viewState === ViewState.WALLET_INFO ? (
        <>
          <Box padding="16px">
            <ConnectedWalletsButton
              evmAccount={evmAccount}
              solanaAccount={solanaAccount}
              onClick={() => {
                setConnectedWalletModalVisible(true)
                setViewState(ViewState.CONNECTED_WALLETS)
              }}
            />
          </Box>
        </>
      ) : null}
      {viewState > ViewState.SEND_ASSETS && (
        <FlexGap py="16px" gap="8px" justifyContent="space-between" alignItems="center">
          <FlexGap alignItems="center" gap="8px" ml={isMobile ? '8px' : '16px'}>
            <Button
              variant="tertiary"
              style={{ width: '34px', height: '34px', padding: '6px', borderRadius: '12px' }}
              onClick={() => {
                if (ViewState.CLAIM_GIFT_CONFIRM === viewState) {
                  setCode('')
                }
                goBack()
              }}
            >
              <ArrowBackIcon fontSize="24px" color={theme.colors.primary60} />
            </Button>
            {[ViewState.RECEIVE_OPTIONS, ViewState.RECEIVE_QR].includes(viewState) && (
              <Text fontSize="20px" fontWeight="600" color="text">
                {t('Receive Crypto')}
              </Text>
            )}
            {[ViewState.CLAIM_GIFT, ViewState.CLAIM_GIFT_CONFIRM].includes(viewState) && (
              <Text fontSize="20px" fontWeight="600" color="text">
                {t('Claim Gift')}
              </Text>
            )}
          </FlexGap>
        </FlexGap>
      )}

      <CancelGiftProvider>
        <Box padding={isMobile ? '0' : '0 16px 16px'}>
          {viewState >= ViewState.SEND_ASSETS ? (
            actionView
          ) : (
            <>
              {!noAssets && (
                <Box mb="16px" onClick={(e) => e.stopPropagation()}>
                  <TabsComponent
                    view={view}
                    solanaAccount={solanaAccount}
                    evmAccount={evmAccount}
                    handleClick={handleClick}
                    style={{ backgroundColor: 'transparent', padding: '0', borderBottom: 'none' }}
                  />
                </Box>
              )}
              <Card background={theme.colors.cardSecondary} mb="16px">
                <CardBody p="16px">
                  <Text fontSize="20px" fontWeight="600" mb="8px">
                    {t('My Wallet')}
                  </Text>
                  <FlexGap alignItems="center" gap="3px">
                    <TotalBalanceInteger lineHeight={1.2}>${balanceDisplay.integer}</TotalBalanceInteger>
                    <TotalBalanceDecimal lineHeight={1.2}>.{balanceDisplay.decimal}</TotalBalanceDecimal>
                  </FlexGap>
                </CardBody>
              </Card>
              {view === WalletView.GIFTS ? (
                <GiftsDashboard setViewState={setViewState} />
              ) : view === WalletView.WALLET_INFO && !noAssets ? (
                <Box mt="16px">
                  <AssetsList assets={balances} isLoading={isLoading} />
                </Box>
              ) : (
                !noAssets && (
                  <Box padding="16px 0" maxHeight="280px" overflow="auto">
                    <RecentTransactions />
                  </Box>
                )
              )}
            </>
          )}
        </Box>
      </CancelGiftProvider>
      {viewState === ViewState.WALLET_INFO && (
        <>
          {noAssets ? (
            chainId === NonEVMChainId.SOLANA ? (
              <EmptyWalletActions
                onDismiss={onDismiss}
                setViewState={setViewState}
                description={t('This wallet looks new. Does not have any assets.')}
              />
            ) : (
              <EmptyWalletActions onDismiss={onDismiss} setViewState={setViewState} />
            )
          ) : view === WalletView.GIFTS ? null : (
            <ActionButtonsContainer>
              <FlexGap gap="8px" width="100%">
                <ActionButton
                  onClick={() => {
                    router.push('/buy-crypto')
                    onDismiss()
                  }}
                  variant="tertiary"
                >
                  {t('Buy')}
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    setViewState(ViewState.SEND_ASSETS)
                    setSendEntry(SEND_ENTRY.SEND_ONLY)
                  }}
                  variant="tertiary"
                >
                  {t('Send')}
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    setViewState(ViewState.RECEIVE_OPTIONS)
                  }}
                  variant="tertiary"
                >
                  {t('Receive')}
                </ActionButton>
              </FlexGap>

              <Button
                variant="text"
                onClick={() => {
                  router.push('/bridge')
                  onDismiss()
                }}
              >
                {t('Bridge Crypto')}?
                <ArrowForwardIcon color="primary" />
              </Button>
            </ActionButtonsContainer>
          )}
        </>
      )}
    </Box>
  )
}

export default WalletModal
