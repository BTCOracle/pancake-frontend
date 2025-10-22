import { Box, CopyButton, Flex, FlexProps, Image, Text, WalletFilledV2Icon } from '@pancakeswap/uikit'
import { useQuery } from '@tanstack/react-query'
import { ASSET_CDN } from 'config/constants/endpoints'
import { walletsConfig } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useIsSmartAccount } from 'hooks/useIsSmartAccount'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { Connector, useAccount, useConnect } from 'wagmi'
import { legacyPreviouslyUsedWalletsAtom } from '@pancakeswap/ui-wallets'
import { useWallet } from '@solana/wallet-adapter-react'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useSocialLoginProviderAtom } from '../../wallet/Privy/atom'

interface CopyAddressProps extends FlexProps {
  account: string | undefined
  tooltipMessage: string
}

const Wrapper = styled(Flex)`
  align-items: center;
  justify-content: flex-start;
  border-radius: 16px;
  position: relative;
  padding: 8px 16px;
`

const WalletIcon = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
`

const SocialIconWrapper = styled.div<{ $needsWhiteBg?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${({ $needsWhiteBg }) => ($needsWhiteBg ? 'white' : 'transparent')};
  padding: ${({ $needsWhiteBg }) => ($needsWhiteBg ? '4px' : '0')};
`

const AddressBox = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const WalletAddress = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CopyButtonWrapper = styled(Box)`
  margin-left: 8px;
`
const DAPP_LIST = [
  'isBinance',
  'isCoinbaseWallet',
  'isOkxWallet',
  'isTokenPocket',
  'isSafePal',
  'isTrust',
  'isTrustWallet',
  'isBraveWallet',
  'isWalletConnect',
  'isOpera',
  'isRabby',
  'isMathWallet',
  'isCoin98',
  'isBlocto',
  'isCyberWallet',
]
const DAPP_WALLET_ICON = {
  [DAPP_LIST[0]]: `${ASSET_CDN}/web/wallets/binance-w3w.png`,
  [DAPP_LIST[1]]: `${ASSET_CDN}/web/wallets/coinbase.png`,
  [DAPP_LIST[2]]: `${ASSET_CDN}/web/wallets/okx-wallet.png`,
  [DAPP_LIST[3]]: `${ASSET_CDN}/web/wallets/tokenpocket.png`,
  [DAPP_LIST[4]]: `${ASSET_CDN}/web/wallets/safepal.png`,
  [DAPP_LIST[5]]: `${ASSET_CDN}/web/wallets/trust.png`,
  [DAPP_LIST[6]]: `${ASSET_CDN}/web/wallets/trust.png`,
  [DAPP_LIST[7]]: `${ASSET_CDN}/web/wallets/brave.png`,
  [DAPP_LIST[8]]: `${ASSET_CDN}/web/wallets/walletconnect.png`,
  [DAPP_LIST[9]]: `${ASSET_CDN}/web/wallets/opera.png`,
  [DAPP_LIST[10]]: `${ASSET_CDN}/web/wallets/rabby.png`,
  [DAPP_LIST[11]]: `${ASSET_CDN}/web/wallets/mathwallet.png`,
  [DAPP_LIST[12]]: `${ASSET_CDN}/web/wallets/coin98.png`,
  [DAPP_LIST[13]]: `${ASSET_CDN}/web/wallets/blocto.png`,
  [DAPP_LIST[14]]: `${ASSET_CDN}/web/wallets/cyberwallet.png`,
}

const getDappIcon = async (connector?: Connector) => {
  if (!connector || typeof connector.getProvider !== 'function') return undefined
  const provider = (await connector?.getProvider()) as any
  const walletName = DAPP_LIST.find((d) => provider?.[d] === true)
  if (!walletName) return undefined
  return DAPP_WALLET_ICON?.[walletName]
}

const useDappIcon = () => {
  const { connector } = useAccount()
  const { data: dappIcon } = useQuery({
    queryKey: ['dappIcon', connector?.uid],
    queryFn: () => getDappIcon(connector!),
  })
  return { dappIcon }
}

const useSolanaWalletIcon = () => {
  const { wallet } = useWallet()
  return wallet?.adapter.icon
}

const SOCIAL_LOGIN_ICONS = {
  google: `${ASSET_CDN}/web/wallets/social-login/google.jpg`,
  x: `${ASSET_CDN}/web/wallets/social-login/x.svg`,
  telegram: `${ASSET_CDN}/web/wallets/social-login/telegram.svg`,
  discord: `${ASSET_CDN}/web/wallets/social-login/discord.svg`,
}

export const CopyAddress: React.FC<React.PropsWithChildren<CopyAddressProps>> = ({
  account,
  tooltipMessage,
  ...props
}) => {
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()
  const isSmartAccount = useIsSmartAccount()

  // TODO @ChefJerry, add previouslyUsedSolanaWalletsAtom support
  const [previouslyUsedEvmWalletsId] = useAtom(legacyPreviouslyUsedWalletsAtom)
  const [socialProvider] = useSocialLoginProviderAtom()

  const walletConfig = walletsConfig({ chainId, connect: connectAsync })

  const { dappIcon } = useDappIcon()
  const solanaWalletIcon = useSolanaWalletIcon()
  const walletIcon = useMemo(() => {
    if (chainId === NonEVMChainId.SOLANA) {
      return solanaWalletIcon
    }
    const evmWallet = walletConfig.find((w) => w.id === previouslyUsedEvmWalletsId[0])
    return evmWallet?.icon
  }, [walletConfig, chainId, solanaWalletIcon, previouslyUsedEvmWalletsId])

  const socialIcon = useMemo(() => {
    return socialProvider && isSmartAccount ? SOCIAL_LOGIN_ICONS[socialProvider] : null
  }, [socialProvider, isSmartAccount])

  const needsWhiteBackground = useMemo(() => {
    return Boolean(socialProvider && isSmartAccount && ['x', 'discord', 'telegram'].includes(socialProvider))
  }, [socialProvider, isSmartAccount])

  // Format the address to show only the first 6 and last 4 characters
  const formatAddress = (address: string | undefined) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Box position="relative" {...props} onClick={(e) => e.stopPropagation()}>
      <Wrapper>
        <WalletIcon>
          {socialIcon ? (
            <SocialIconWrapper $needsWhiteBg={needsWhiteBackground}>
              <Image src={socialIcon} width={32} height={32} alt="Social Login" />
            </SocialIconWrapper>
          ) : walletIcon ? (
            <Image src={walletIcon as string} width={40} height={40} alt="Wallet" />
          ) : dappIcon ? (
            <Image src={dappIcon} width={40} height={40} alt="Wallet" />
          ) : (
            <WalletFilledV2Icon width={28} height={28} color="primary" />
          )}
        </WalletIcon>
        <AddressBox>
          <WalletAddress title={account}>{formatAddress(account)}</WalletAddress>
        </AddressBox>
        <CopyButtonWrapper>
          <CopyButton width="16px" text={account ?? ''} tooltipMessage={tooltipMessage} />
        </CopyButtonWrapper>
      </Wrapper>
    </Box>
  )
}
