import { useTranslation } from '@pancakeswap/localization'
import { useIsMounted } from '@pancakeswap/hooks'
import { Box, Text, UserMenu, UserMenuDivider, UserMenuItem } from '@pancakeswap/uikit'
import Image from 'next/image'
import { APEX_DOMAIN, ASSET_CDN } from '@/utils/config/endpoint'
import { APTOS_MENU } from '@/utils/config/chains'

const evmChains = [
  { id: 56, name: 'BNB Chain', chainName: 'bsc' },
  { id: 1, name: 'Ethereum', chainName: 'eth' },
  { id: 324, name: 'zkSync Era', chainName: 'zkSync' },
  { id: 42161, name: 'Arbitrum One', chainName: 'arb' },
  { id: 59144, name: 'Linea', chainName: 'linea' },
  { id: 8453, name: 'Base', chainName: 'base' },
  { id: 204, name: 'opBNB Mainnet', chainName: 'opBNB' },
  { id: 10143, name: 'Monad Testnet', chainName: 'monad' }
]

const NON_EVM_CHAINS = [APTOS_MENU]

const NetworkSelect = () => {
  const { t } = useTranslation()

  return (
    <>
      <Box px="16px" py="8px">
        <Text color="textSubtle">{t('Select a Network')}</Text>
      </Box>
      <UserMenuDivider />
      {evmChains.map((chain) => (
        <UserMenuItem
          key={chain.id}
          style={{ justifyContent: 'flex-start' }}
          as="a"
          target="_blank"
          href={`${APEX_DOMAIN}?chain=${chain.chainName}`}
        >
          <Image src={`${ASSET_CDN}/web/chains/${chain.id}.png`} width={24} height={24} unoptimized alt={`chain-${chain.id}`} />
          <Text color="text" pl="12px">
            {chain.name}
          </Text>
        </UserMenuItem>
      ))}
      {NON_EVM_CHAINS.map((chain) => (
        <UserMenuItem key={chain.id} style={{ justifyContent: 'flex-start' }} as="a" target="_blank" href={chain.link}>
          <Image src={chain.image} width={24} height={24} unoptimized alt={`chain-${chain.id}`} />
          <Text color="text" pl="12px">
            {chain.name}
          </Text>
        </UserMenuItem>
      ))}
    </>
  )
}

export const NetworkSwitcher = () => {
  const isMounted = useIsMounted()

  return (
    <UserMenu
      mr="8px"
      variant="default"
      avatarSrc="https://tokens.pancakeswap.finance/images/symbol/sol.png"
      placement="bottom"
      text={
        <>
          <Box display={['none', null, null, null, null, 'block']}>Solana</Box>
          <Box display={['block', null, null, null, null, 'none']}>SOL</Box>
        </>
      }
      zIndex={1}
    >
      {({ isOpen }) => (isOpen ? <NetworkSelect /> : null)}
    </UserMenu>
  )
}
