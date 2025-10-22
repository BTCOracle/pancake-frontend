import { Box, Flex, Text, Image, WalletFilledV2Icon, FlexGap, ChevronRightIcon } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { useConnect } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { ASSET_CDN } from 'config/constants/endpoints'
import { walletsConfig } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { SolanaWalletModal } from 'wallet/SolanaWalletModal'
import { previouslyUsedEvmWalletsAtom } from '@pancakeswap/ui-wallets/src/state/atom'

interface ReceiveOptionsViewProps {
  onSelectEVM: () => void
  onSelectSolana: () => void
  evmAccount?: string
  solanaAccount?: string
}

const OptionCard = styled(Box)<{ $clickable?: boolean }>`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 16px;
  padding: 8px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  height: 64px;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:hover {
    ${({ $clickable, theme }) =>
      $clickable &&
      `background: ${theme.colors.tertiary};
    `}
  }
`

const IconContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`

const ChainIconWrapper = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  background: ${({ theme }) => theme.colors.cardSecondary};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const EVMIcon = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-image: url('${ASSET_CDN}/web/wallet-ui/network-tag-evm.svg');
  background-size: 40px 40px;
  background-repeat: no-repeat;
  background-position: center;
`

const SolanaIcon = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-image: url('${ASSET_CDN}/web/wallet-ui/network-tag-solana.png');
  background-size: 40px 40px;
  background-repeat: no-repeat;
  background-position: center;
`

const WalletIconWrapper = styled(Box)`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  position: absolute;
  bottom: -4px;
  right: -4px;
  border: 2px solid ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  z-index: 10;

  img {
    border-radius: 4px;
  }
`

const ReceiveOptionsView: React.FC<ReceiveOptionsViewProps> = ({
  onSelectEVM,
  onSelectSolana,
  evmAccount,
  solanaAccount,
}) => {
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()
  const { wallet: solanaWallet } = useWallet()

  const previouslyUsedEvmWalletsId = useAtomValue(previouslyUsedEvmWalletsAtom)
  const walletConfig = walletsConfig({ chainId, connect: connectAsync })

  // Get EVM wallet icon - only show specific wallet icon when connected
  const evmWalletIcon = useMemo(() => {
    // Only show specific wallet icon if user is actually connected
    if (!evmAccount) {
      return null // Show generic wallet icon when not connected
    }
    const evmWallet = walletConfig.find((w) => w.id === previouslyUsedEvmWalletsId[0])
    return evmWallet?.icon
  }, [walletConfig, previouslyUsedEvmWalletsId, evmAccount])

  // Get Solana wallet icon - only show specific wallet icon when connected
  const solanaWalletIcon = useMemo(() => {
    // Only show specific wallet icon if user is actually connected
    if (!solanaAccount) {
      return null // Show generic wallet icon when not connected
    }
    return solanaWallet?.adapter.icon
  }, [solanaWallet, solanaAccount])

  return (
    <Box padding="12px 0px" maxWidth="450px" width="100%">
      <FlexGap gap="12px" flexDirection="column">
        <OptionCard $clickable={Boolean(evmAccount)} onClick={evmAccount ? onSelectEVM : undefined}>
          <Flex alignItems="center">
            <IconContainer>
              <ChainIconWrapper>
                <EVMIcon />
                <WalletIconWrapper>
                  {evmWalletIcon ? (
                    <Image src={evmWalletIcon as string} width={16} height={16} alt="EVM Wallet" />
                  ) : (
                    <WalletFilledV2Icon width={16} height={16} color="primary" />
                  )}
                </WalletIconWrapper>
              </ChainIconWrapper>
              <Box>
                <Text fontSize="16px" fontWeight="600" color="text">
                  EVM
                </Text>
                <Text fontSize="12px" color="textSubtle">
                  {evmAccount ? `${evmAccount.slice(0, 6)}...${evmAccount.slice(-4)}` : 'No EVM wallet'}
                </Text>
              </Box>
            </IconContainer>
          </Flex>
          {evmAccount ? (
            <ChevronRightIcon color="textSubtle" width="24px" height="24px" />
          ) : (
            <ConnectWalletButton variant="primary" scale="sm">
              Connect
            </ConnectWalletButton>
          )}
        </OptionCard>

        <OptionCard $clickable={Boolean(solanaAccount)} onClick={solanaAccount ? onSelectSolana : undefined}>
          <Flex alignItems="center">
            <IconContainer>
              <ChainIconWrapper>
                <SolanaIcon />
                <WalletIconWrapper>
                  {solanaWalletIcon ? (
                    <Image src={solanaWalletIcon} width={16} height={16} alt="Solana Wallet" />
                  ) : (
                    <WalletFilledV2Icon width={16} height={16} color="primary" />
                  )}
                </WalletIconWrapper>
              </ChainIconWrapper>
              <Box>
                <Text fontSize="16px" fontWeight="600" color="text">
                  Solana
                </Text>
                <Text fontSize="12px" color="textSubtle">
                  {solanaAccount ? `${solanaAccount.slice(0, 6)}...${solanaAccount.slice(-4)}` : 'No Solana wallet'}
                </Text>
              </Box>
            </IconContainer>
          </Flex>
          {solanaAccount ? (
            <ChevronRightIcon color="textSubtle" width="24px" height="24px" />
          ) : (
            <ConnectWalletButton variant="primary" scale="sm">
              Connect
            </ConnectWalletButton>
          )}
        </OptionCard>
      </FlexGap>
      <SolanaWalletModal />
    </Box>
  )
}

export default ReceiveOptionsView
