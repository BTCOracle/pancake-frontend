import { Box, CopyIcon, Flex, Text, Image, WalletFilledV2Icon } from '@pancakeswap/uikit'
import { useState, useMemo } from 'react'
import { styled } from 'styled-components'
import { useConnect } from 'wagmi'
import { useWallet } from '@solana/wallet-adapter-react'
import { ASSET_CDN } from 'config/constants/endpoints'
import { walletsConfig } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAtomValue } from 'jotai'
import { NonEVMChainId } from '@pancakeswap/chains'
import { previouslyUsedEvmWalletsAtom } from '@pancakeswap/ui-wallets/src/state/atom'

interface QRCodeCopyButtonProps {
  account: string
  chainType?: 'evm' | 'solana'
  walletIcon?: string
}

const CopyContainer = styled(Box)`
  background: ${({ theme }) => theme.colors.cardSecondary};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  padding: 8px 16px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  height: 64px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
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
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.cardSecondary};
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

const CopyButton = styled(Box)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};

    svg {
      color: white !important;
    }
  }
`

const QRCodeCopyButton: React.FC<QRCodeCopyButtonProps> = ({ account, chainType, walletIcon: providedWalletIcon }) => {
  const [copied, setCopied] = useState(false)
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()
  const { wallet: solanaWallet } = useWallet()

  const previouslyUsedEvmWalletsId = useAtomValue(previouslyUsedEvmWalletsAtom)

  const walletConfig = walletsConfig({ chainId, connect: connectAsync })

  // Determine if current chain is Solana based on chainType prop or fallback to current chain
  const isSolana = chainType === 'solana' || (chainType === undefined && chainId === NonEVMChainId.SOLANA)

  // Get wallet icon - use provided icon or fallback to auto-detection
  // Follow ReceiveOptionsView logic: only show specific wallet icon when connected
  const walletIcon = useMemo(() => {
    if (providedWalletIcon) {
      return providedWalletIcon
    }

    // Only show specific wallet icon when account is provided (user is connected)
    if (!account) {
      return null
    }

    if (isSolana) {
      return solanaWallet?.adapter.icon
    }
    const evmWallet = walletConfig.find((w) => w.id === previouslyUsedEvmWalletsId[0])
    return evmWallet?.icon
  }, [providedWalletIcon, isSolana, solanaWallet, walletConfig, previouslyUsedEvmWalletsId, account])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(account)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Box width="100%" mb="16px">
      <CopyContainer>
        <Flex alignItems="center">
          <IconContainer>
            <ChainIconWrapper>
              {isSolana ? <SolanaIcon /> : <EVMIcon />}
              <WalletIconWrapper>
                {walletIcon ? (
                  <Image src={walletIcon as string} width={16} height={16} alt="Wallet" />
                ) : (
                  <WalletFilledV2Icon width={16} height={16} color="primary" />
                )}
              </WalletIconWrapper>
            </ChainIconWrapper>
            <Box>
              <Text fontSize="16px" fontWeight="600" color="text">
                {isSolana ? 'Solana' : 'EVM'}
              </Text>
              <Text fontSize="12px" color="textSubtle">
                {formatAddress(account)}
              </Text>
            </Box>
          </IconContainer>
        </Flex>

        <CopyButton onClick={handleCopy}>
          <CopyIcon width="20px" height="20px" color={copied ? 'white' : 'textSubtle'} />
        </CopyButton>
      </CopyContainer>
    </Box>
  )
}

export default QRCodeCopyButton
