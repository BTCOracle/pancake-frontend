import { Box, Divider } from '@chakra-ui/react'
import { useHttpLocations } from '@pancakeswap/hooks'
import { AutoColumn, Row, RowBetween, RowFixed, Text, Toggle, TokenLogo } from '@pancakeswap/uikit'
import { JupTokenType } from '@pancakeswap/solana-core-sdk'
import { ReactNode } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore, USER_ADDED_KEY, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { setStorageItem } from '@/utils/localStorage'

export default function TokenListSetting({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  const mintGroup = useTokenStore((s) => s.mintGroup)

  const isOfficialTokenListSwitchOn = useAppStore((s) => s.displayTokenSettings.official)
  const isRaydiumTokenListSwitchOn = useAppStore((s) => s.displayTokenSettings.raydium)
  const isJuiterTokenListSwitchOn = useAppStore((s) => s.displayTokenSettings.jup)
  const isUserAddedTokenListSwitchOn = useAppStore((s) => s.displayTokenSettings.userAdded)

  const officialTokenListTokenCount = mintGroup.official.size
  const raydiumTokenListTokenCount = mintGroup.raydium.size
  const jupiterTokenListTokenCount = mintGroup.jup.size
  const userAddedTokenListTokenCount = useTokenStore.getState().extraLoadedTokenList.length

  const jupiterTokenListTypes = [JupTokenType.Strict]
  const renderItem = useEvent((v: string) => t(`token_selector.jupiter_types_${v.toLocaleLowerCase()}`))
  const currentJupiterTokenListType = useAppStore((s) => s.jupTokenType)

  const handleJupiterTokenListTypeChange = useEvent((type: JupTokenType) => {
    useTokenStore.getState().loadTokensAct(false, type)
  })

  const handleSwitchChange = useEvent((name: 'official' | 'raydium' | 'jup' | 'userAdded', turnOn: boolean) => {
    if (name === 'userAdded') setStorageItem(USER_ADDED_KEY, String(turnOn))
    useAppStore.setState((s) => ({ displayTokenSettings: { ...s.displayTokenSettings, [name]: turnOn } }))
  })

  return (
    <Box height="50vh">
      <TokenListRowItem
        name={`Official ${t('Token List')}`}
        logoUrl="https://pancakeswap.finance/logo.png"
        tokenCount={officialTokenListTokenCount}
        isOpen={isOfficialTokenListSwitchOn}
        onOpen={() => handleSwitchChange('official', true)}
        onClose={() => handleSwitchChange('official', false)}
      />
      <Divider my="10px" color={colors.backgroundTransparent12} />
      <TokenListRowItem
        name={`Raydium ${t('Token List')}`}
        logoUrl="https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png"
        tokenCount={raydiumTokenListTokenCount}
        isOpen={isRaydiumTokenListSwitchOn}
        onOpen={() => handleSwitchChange('raydium', true)}
        onClose={() => handleSwitchChange('raydium', false)}
      />
      <Divider my="10px" color={colors.backgroundTransparent12} />
      <TokenListRowItem
        name={`Jupiter ${t('Token List')}`}
        logoUrl="https://jup.ag/_next/image?url=%2Fsvg%2Fjupiter-logo.png&w=96&q=75"
        tokenCount={jupiterTokenListTokenCount}
        isOpen={isJuiterTokenListSwitchOn}
        onOpen={() => handleSwitchChange('jup', true)}
        onClose={() => handleSwitchChange('jup', false)}
        typeItems={jupiterTokenListTypes}
        renderItem={renderItem}
        currentTypeItem={currentJupiterTokenListType}
        onTypeItemChange={(v) =>
          jupiterTokenListTypes.includes(v as JupTokenType) && handleJupiterTokenListTypeChange(v.toLowerCase() as JupTokenType)
        }
      />
      <Divider my="10px" color={colors.backgroundTransparent12} />
      <TokenListRowItem
        name={`${t('User Added')} ${t('Token List')}`}
        tokenCount={userAddedTokenListTokenCount}
        isOpen={isUserAddedTokenListSwitchOn}
        onOpen={() => handleSwitchChange('userAdded', true)}
        onClose={() => handleSwitchChange('userAdded', false)}
        onClick={() => onClick()}
      />
    </Box>
  )
}

const StyledListLogo = styled(TokenLogo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`

export function ListLogo({
  logoURI,
  style,
  size = '24px',
  alt
}: {
  logoURI: string
  size?: string
  style?: React.CSSProperties
  alt?: string
}) {
  const srcs: string[] = useHttpLocations(logoURI)

  return <StyledListLogo alt={alt} size={size} srcs={srcs} style={style} />
}

const RowWrapper = styled.div<{ active: boolean; hasActiveTokens: boolean }>`
  display: flex;
  background-color: ${({ active }) => (active ? '#31D0AA19' : 'transparent')};
  border: solid 1px;
  border-color: ${({ active }) => (active ? colors.success : colors.tertiary)};
  transition: 200ms;
  align-items: center;
  padding: 1rem;
  border-radius: 20px;
  opacity: ${({ hasActiveTokens }) => (hasActiveTokens ? 1 : 0.4)};
`

function TokenListRowItem({
  name,
  logoUrl,
  tokenCount,
  switchable = true,
  isOpen,
  onOpen,
  onClose,
  onClick,
  typeItems,
  renderItem,
  currentTypeItem,
  onTypeItemChange
}: {
  name: string
  tokenCount: number
  logoUrl?: string
  switchable?: boolean
  typeItems?: string[]
  renderItem?: (v: string) => ReactNode
  currentTypeItem?: string
  onTypeItemChange?: (type: string) => void
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  onClick?: () => void
}) {
  return (
    <RowWrapper active={!!isOpen} hasActiveTokens={!!tokenCount}>
      <RowBetween>
        <RowFixed>
          {logoUrl ? <ListLogo logoURI={logoUrl} size="40px" /> : <div style={{ width: '24px', height: '24px', marginRight: '1rem' }} />}
          <AutoColumn gap="4px" style={{ marginLeft: '20px' }}>
            <Text bold>{name}</Text>
            <Text color="textSubtle" small textTransform="lowercase">
              {tokenCount} tokens
            </Text>
          </AutoColumn>
        </RowFixed>
      </RowBetween>
      <Toggle
        checked={isOpen}
        onChange={() => {
          isOpen ? onClose?.() : onOpen?.()
        }}
      />
    </RowWrapper>
  )
}
