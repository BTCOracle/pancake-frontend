import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import {
  CogIcon,
  LangSelector,
  LanguageIcon,
  LogoIcon,
  LogoWithTextIcon,
  ModalV2,
  MotionModal,
  useMatchBreakpoints,
  useModalV2
} from '@pancakeswap/uikit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode } from 'react'
import { languageList, useTranslation } from '@pancakeswap/localization'
import { colors } from '@/theme/cssVariables'
import { appLayoutPaddingX } from '@/theme/detailConfig'
import { pageRoutePathnames } from '@/utils/config/routers'
import useResponsive from '@/hooks/useResponsive'

import { Desktop, Mobile } from '../MobileDesktop'
import { NetworkSwitcher } from '../NetworkSwitcher'
import SolWallet from '../SolWallet'
import { MobileBottomNavbar } from './MobileBottomNavbar'
import { ColorThemeSettingField } from './components/ColorThemeSettingField'
import { DefaultExplorerSettingField } from './components/DefaultExplorerSettingField'
import DisclaimerModal from './components/DisclaimerModal'
import { PriorityButton } from './components/PriorityButton'
import { RPCConnectionSettingField } from './components/RPCConnectionSettingField'
import { Divider } from './components/SettingFieldDivider'
import { SlippageToleranceSettingField } from './components/SlippageToleranceSettingField'
import { VersionedTransactionSettingField } from './components/VersionedTransactionSettingField'

export interface NavSettings {
  // colorTheme: 'dark' | 'light'
}

function AppNavLayout({
  children,
  overflowHidden,
  fullSize = false
}: {
  children: ReactNode
  /** use screen height */
  overflowHidden?: boolean
  /** no padding */
  fullSize?: boolean
}) {
  const { t } = useTranslation()
  const { pathname } = useRouter()
  const { isMobile, isTablet } = useResponsive()

  return (
    <Flex direction="column" id="app-layout" height="full" overflow={overflowHidden ? 'hidden' : 'auto'}>
      <HStack
        className="navbar"
        flex="none"
        height={['64px', '56px']}
        px={['20px', '16px']}
        gap={['4px', '3vw', '24px']}
        alignItems="center"
        justifyContent="space-between"
        borderBottom={`1px solid ${colors.cardBorder01}`}
        bgColor={colors.cardBg}
        zIndex={19}
      >
        {/* logo */}
        {isMobile || isTablet ? <LogoIcon className="mobile-icon" /> : <LogoWithTextIcon width="160px" className="desktop-icon" />}

        {/* nav routes */}
        <Desktop>
          <HStack flexGrow={1} justify="start" overflow={['auto', 'visible']} gap={[0, 0, '1vw']}>
            <RouteLink href={pageRoutePathnames.swap} isActive={pathname === pageRoutePathnames.swap} title={t('Swap')} />
            <RouteLink href={pageRoutePathnames.pools} isActive={pathname.includes(pageRoutePathnames.pools)} title={t('Liquidity')} />
            <RouteLink href={pageRoutePathnames.portfolio} isActive={pathname === pageRoutePathnames.portfolio} title={t('My Positions')} />
          </HStack>
        </Desktop>

        {/* wallet button */}
        <Flex gap={[0.5, 2]} align="center">
          <PriorityButton />
          <LangSwitcher />
          <SettingsMenu />
          <NetworkSwitcher />
          <SolWallet />
        </Flex>
      </HStack>

      <Box
        px={fullSize ? 0 : appLayoutPaddingX}
        pt={fullSize ? 0 : [4, 4]}
        flex={1}
        overflow={overflowHidden ? 'hidden' : 'auto'}
        display="flex"
        flexDirection="column"
        justifyItems="flex-start"
        sx={{
          scrollbarGutter: 'stable',
          contain: 'size',
          '& > *': {
            // for flex-col container
            flex: 'none'
          }
        }}
      >
        {children}
      </Box>
      <DisclaimerModal />
      <Mobile>
        <Box className="mobile_bottom_navbar" flex="none">
          <MobileBottomNavbar />
        </Box>
      </Mobile>
    </Flex>
  )
}

function RouteLink({
  href,
  isActive,
  title,
  external = false
}: {
  href: string
  isActive: boolean
  title: string | React.ReactNode
  external?: boolean
}) {
  return (
    <Link
      href={href}
      shallow
      {...(external
        ? {
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        : {})}
    >
      <Text
        as="span"
        textColor={isActive ? colors.textSecondary : colors.textSubtle}
        fontSize="md"
        fontWeight={isActive ? 600 : 400}
        px={4}
        py={2}
        rounded="xl"
        transition="200ms"
        _hover={{ bg: colors.backgroundLight }}
      >
        {title}
      </Text>
    </Link>
  )
}

function SettingsMenu({ color }: { color?: string }) {
  const { isOpen, setIsOpen, onDismiss } = useModalV2()
  const openModal = () => setIsOpen(true)

  return (
    <>
      <Box
        w={10}
        h={10}
        p="0"
        onClick={openModal}
        _hover={{ bg: colors.backgroundLight }}
        rounded="full"
        display="grid"
        placeContent="center"
        cursor="pointer"
      >
        <CogIcon height={24} width={24} color={color || 'textSubtle'} />
      </Box>
      <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
        <SettingsMenuModalContent onDismiss={onDismiss} />
      </ModalV2>
    </>
  )
}

function SettingsMenuModalContent({ onDismiss }: { onDismiss: () => void }) {
  const { isMobile } = useMatchBreakpoints()
  const { t } = useTranslation()
  return (
    <MotionModal
      title={t('Settings')}
      minWidth={[null, null, '500px']}
      minHeight={isMobile ? '500px' : undefined}
      headerPadding="2px 14px 0 24px"
      onDismiss={onDismiss}
    >
      <SlippageToleranceSettingField />
      <Divider />
      <SlippageToleranceSettingField variant="liquidity" />
      <Divider />
      <VersionedTransactionSettingField />
      <Divider />
      <DefaultExplorerSettingField />
      <Divider />
      {/* <LanguageSettingField /> */}
      {/* <Divider /> */}
      <ColorThemeSettingField />
      <Divider />
      <RPCConnectionSettingField />
    </MotionModal>
  )
}

function LangSwitcher() {
  const { currentLanguage, setLanguage } = useTranslation()
  const currentLang = currentLanguage.code
  return (
    <Box w={10} h={10} _hover={{ bg: colors.backgroundLight }} rounded="full" display="grid" placeContent="center" cursor="pointer">
      <LangSelector currentLang={currentLang} langs={languageList} setLang={setLanguage} buttonScale="xs" color="textSubtle" hideLanguage>
        <LanguageIcon color="textSubtle" width="24px" />
      </LangSelector>
    </Box>
  )
}

export default AppNavLayout
