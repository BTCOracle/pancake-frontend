import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Image,
  Link,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Switch,
  UnorderedList,
  useColorMode
} from '@chakra-ui/react'
import { LinkExternal, Text, Toggle, WalletFilledIcon } from '@pancakeswap/uikit'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { Wallet } from '@solana/wallet-adapter-react'
import { useCallback, useState } from 'react'
import { Trans, useTranslation } from '@pancakeswap/localization'
// import TealCircleCheckBadge from '@/icons/misc/TealCircleCheckBadge'
// import AvalancheNetworkIcon from '@/icons/networks/AvalancheNetworkIcon'
// import BinanceNetworkIcon from '@/icons/networks/BinanceNetworkIcon'
// import EthereumNetworkIcon from '@/icons/networks/EthereumNetworkIcon'
// import PolygonNetworkIcon from '@/icons/networks/PolygonNetworkIcon'
// import SolanaNetworkIcon from '@/icons/networks/SolanaNetworkIcon'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import DesktopIcon from '@/icons/misc/DesktopIcon'
import ExternalLink from '@/icons/misc/ExternalLink'
import MobileIcon from '@/icons/misc/MobileIcon'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'

interface Props {
  wallets: Wallet[]
  isOpen: boolean
  onSelectWallet: (wallet: Wallet) => void
  onClose: () => void
}

// type Network = { name: string; icon?: JSX.Element }

export default function SelectWalletModal({ wallets, isOpen, onSelectWallet, onClose }: Props) {
  const { t } = useTranslation()
  const isMobile = useAppStore((s) => s.isMobile)
  /*
  const networks: Network[] = [
    { name: 'Solana', icon: <SolanaNetworkIcon /> },
    { name: 'Avalanche', icon: <AvalancheNetworkIcon /> },
    { name: 'Etherem ', icon: <EthereumNetworkIcon /> },
    { name: 'Binance', icon: <BinanceNetworkIcon /> },
    { name: 'Polygon', icon: <PolygonNetworkIcon /> }
  ]
  const [currentNetwork, setCurrentNetwork] = useState('Solana')
  const connectedNetworks = ['Solana', 'Avalanche']
  */
  const [canShowUninstalledWallets, setCanShowUninstalledWallets] = useState(false)
  const [isWalletNotInstalled, setIsWalletNotInstalled] = useState(false)

  const { recommendedWallets, notInstalledWallets } = splitWallets(wallets)

  const phantomWallet = recommendedWallets.find((w) => w.adapter.name === 'Phantom')

  const handleCloseComplete = useCallback(() => setIsWalletNotInstalled(false), [setIsWalletNotInstalled])

  return (
    <Modal variant="mobileFullPage" isOpen={isOpen} onClose={onClose} onCloseComplete={handleCloseComplete}>
      <ModalOverlay />
      <ModalContent color={colors.textPrimary} width={['unset', '36em']} rounded={[null, '3xl']}>
        <ModalHeader>
          <Text bold>{t('Connect your wallet to PancakeSwap')}</Text>
        </ModalHeader>
        <ModalCloseButton />
        {isWalletNotInstalled ? (
          <ModalBody display="grid">
            <Box overflow="hidden" display="flex" flexDirection="column">
              <Box color={colors.semanticWarning} bg={colors.warnButtonLightBg} p={3} fontSize={['xs', 'sm']} rounded="md">
                {t('Oops... Looks like you don’t have Phantom installed!')}
              </Box>
              <Flex justify="center" mt={10}>
                <Image src={phantomWallet?.adapter.icon} w={100} h={100} />
              </Flex>
              <Flex justify="center" textAlign="center" mt={6}>
                <Link href="https://phantom.com" isExternal>
                  <Button fontWeight="medium" gap={1}>
                    {t('Install Phantom')}
                    <ExternalLink cursor="pointer" width="14" height="14" color={colors.buttonSolidText} />
                  </Button>
                </Link>
              </Flex>
              <Flex align="start" flexDirection="column" color={colors.textSecondary} px={3} mt={12}>
                <Text>{t('How to install Phantom?')}</Text>
                <Flex flexDirection="column" align="flex-start" justify="flex-start" pl={1} textAlign="start" mt={5} fontSize="14px">
                  <HStack>
                    <MobileIcon />
                    <Text fontWeight="medium">{t('On mobile:')}</Text>
                  </HStack>
                  <UnorderedList mt={1} pl={10}>
                    <ListItem>{t('Download and open the wallet app instead')}</ListItem>
                  </UnorderedList>
                </Flex>
                <Flex flexDirection="column" align="flex-start" justify="flex-start" pl={1} textAlign="start" mt={5} fontSize="14px">
                  <HStack>
                    <DesktopIcon />
                    <Text fontWeight="medium">{t('On desktop:')}</Text>
                  </HStack>
                  <UnorderedList mt={1} pl={10}>
                    <ListItem>{t('Install at link above then refresh this page')}</ListItem>
                  </UnorderedList>
                </Flex>
              </Flex>
              <Flex flexDirection="column" px={3} mt={12}>
                <Button
                  variant="ghost"
                  w="full"
                  borderRadius="8px"
                  fontWeight="normal"
                  _hover={{ fontWeight: 'medium', border: `1px solid ${colors.buttonPrimary}` }}
                  onClick={() => {
                    if (!phantomWallet || phantomWallet.readyState === WalletReadyState.NotDetected) {
                      window.location.reload()
                    } else {
                      onSelectWallet(phantomWallet)
                      onClose()
                    }
                  }}
                >
                  {t('I’ve already Installed, Refresh page')}
                </Button>
                <Button
                  variant="ghost"
                  w="full"
                  borderRadius="8px"
                  fontWeight="normal"
                  _hover={{ fontWeight: 'medium', border: `1px solid ${colors.buttonPrimary}` }}
                  onClick={() => {
                    setIsWalletNotInstalled(false)
                  }}
                >
                  {t('Go back')}
                </Button>
              </Flex>
            </Box>
          </ModalBody>
        ) : (
          <ModalBody display="grid">
            <Box overflow="hidden" display="flex" flexDirection="column">
              <Box mb={5} color={colors.textPrimary} fontSize="14px">
                {t('By connecting your wallet, you acknowledge that you have read, understand and accept the terms in the')}{' '}
                <Link href="https://pancakeswap.finance/terms-of-service" isExternal>
                  {t('disclaimer')}
                </Link>
              </Box>
              <Box mb={6} flex="1" overflowY="auto" pr="10px">
                <HStack justifyContent="space-between">
                  <Text fontSize="16px" color={colors.textPrimary} bold mb={2}>
                    {t('Choose wallet')}
                  </Text>
                  {isMobile && (
                    <Flex color={colors.textSecondary} fontSize="sm" fontWeight={500} justify="space-between" gap={1} mb={4}>
                      <Text>{t('Show uninstalled')}</Text>
                      <Switch checked={canShowUninstalledWallets} onChange={() => setCanShowUninstalledWallets((b) => !b)} />
                    </Flex>
                  )}
                </HStack>
                {/* have divider  */}
                <SimpleGrid gridTemplateColumns={['1fr', '1fr 1fr']} rowGap={['10px', 3]} columnGap={4}>
                  {recommendedWallets.map((wallet) => (
                    <WalletItem
                      key={wallet.adapter.name}
                      selectable
                      wallet={wallet}
                      onClick={(wallet) => {
                        if (wallet.readyState === WalletReadyState.NotDetected && wallet.adapter.name === 'Phantom') {
                          setIsWalletNotInstalled(true)
                          return
                        }
                        onSelectWallet(wallet)
                      }}
                    />
                  ))}
                </SimpleGrid>

                <Collapse in={canShowUninstalledWallets}>
                  <HStack color={colors.textSecondary} fontSize="sm" my={3}>
                    <Box flexGrow={1} height="1px" color={colors.textTertiary} bg={colors.dividerDashGradient} />
                    <Text>Uninstalled wallets</Text>
                    <Box flexGrow={1} height="1px" color={colors.textTertiary} bg={colors.dividerDashGradient} />
                  </HStack>

                  <SimpleGrid opacity={0.5} gridTemplateColumns="1fr 1fr" rowGap={3} columnGap={4}>
                    {notInstalledWallets.map((wallet) => (
                      <WalletItem selectable={false} key={wallet.adapter.name} wallet={wallet} />
                    ))}
                  </SimpleGrid>
                </Collapse>
              </Box>
              {!isMobile && (
                <Flex
                  bg={colors.backgroundTransparent07}
                  color={colors.textSecondary}
                  fontSize="sm"
                  fontWeight={500}
                  justify="space-between"
                  rounded="xl"
                  py={4}
                  px={5}
                  mb={3}
                >
                  <HStack>
                    <WalletFilledIcon width="24px" height="24px" color="textSubtle" />
                    <Text>{t('Show uninstalled wallets')}</Text>
                  </HStack>
                  <Toggle checked={canShowUninstalledWallets} scale="sm" onChange={() => setCanShowUninstalledWallets((b) => !b)} />
                </Flex>
              )}
            </Box>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  )
}

function WalletItem({
  selectable = true,
  wallet,
  onClick
}: {
  selectable?: boolean
  wallet: Wallet
  onClick?: (wallet: Wallet) => void
  isCurrent?: boolean
}) {
  const { colorMode } = useColorMode()
  const isLight = colorMode !== 'dark'
  return (
    <Flex
      gap={2}
      align="center"
      cursor={selectable ? 'pointer' : 'not-allowed'}
      rounded="2xl"
      bg={isLight ? '#F6F4FB' : '#322B48'}
      py={3}
      px={3}
      pl={[9, 3]}
      onClick={() => onClick?.(wallet)}
    >
      <Image src={wallet.adapter.icon} w={6} h={6} ml={1} />
      <Text bold>{wallet.adapter.name}</Text>
    </Flex>
  )
}

function splitWallets(wallets: Wallet[]): { recommendedWallets: Wallet[]; notInstalledWallets: Wallet[] } {
  // Deduplicate wallets by adapter name to prevent duplicates
  const uniqueWallets = Array.from(new Map(wallets.map((wallet) => [wallet.adapter.name, wallet])).values())

  const supportedWallets = uniqueWallets.filter((w) => w.readyState !== WalletReadyState.Unsupported)
  const recommendedWallets = supportedWallets.filter((w) => w.readyState !== WalletReadyState.NotDetected && w.adapter.name !== 'Sollet')
  const notInstalledWallets = supportedWallets.filter((w) => w.readyState === WalletReadyState.NotDetected && w.adapter.name !== 'Phantom')
  const solletWallet = supportedWallets.find((w) => w.adapter.name === 'Sollet')
  solletWallet && notInstalledWallets.push(solletWallet)
  const phantomWallet = supportedWallets.find((w) => w.adapter.name === 'Phantom')
  phantomWallet && phantomWallet.readyState === WalletReadyState.NotDetected && recommendedWallets.unshift(phantomWallet)
  return { recommendedWallets, notInstalledWallets }
}
