import { useState } from 'react'
import styled from 'styled-components'
import { ArrowDropDownIcon, ArrowDropUpIcon, AtomBox, AutoRow, Button, Flex, FlexGap, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { WalletAdaptedNetwork, WalletConfigV3, WalletIds } from '../../types'
import { WalletSelectItem, WalletSelectSection } from './WalletSelectSection'

export type MoreWalletSectionProps = {
  wallets: WalletConfigV3[]
  onClick: (wallet: WalletConfigV3, network: WalletAdaptedNetwork) => void
  style?: React.CSSProperties
}

const StyledButton = styled(Button)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom: 2px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

const StyledWalletIcon = styled(AtomBox)`
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.dropdown};

  &:not(:first-child) {
    margin-left: -7px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
`

const StyledExtraTag = styled(AtomBox)`
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  padding: 2px 6px;
  margin-left: -7px;
`

const MoreWalletSectionLabel: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation()
  return (
    <FlexGap gap="8px" alignItems="center" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Text textTransform="uppercase" fontSize="12px" fontWeight="600" color="textSubtle" lineHeight={1.5}>
        {t('More Wallets')}
      </Text>
      <ArrowDropUpIcon width="24px" height="24px" color="textSubtle" />
    </FlexGap>
  )
}

export const MoreWalletSection: React.FC<MoreWalletSectionProps> = ({ wallets, onClick, style }) => {
  const extraTagNum = wallets.length - 5
  const installedWallets = wallets.filter((wallet) => wallet.installed && wallet.id !== WalletIds.Solflare)
  const displayWallets = installedWallets.length
    ? wallets.filter((wallet) => !wallet.installed).slice(0, 5)
    : wallets.slice(0, 5)

  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <WalletSelectSection label={<MoreWalletSectionLabel onClick={() => setExpanded(false)} />}>
        {wallets.map((wallet) => (
          <WalletSelectItem key={wallet.id} wallet={wallet} onClick={onClick} />
        ))}
      </WalletSelectSection>
    )
  }

  return (
    <>
      {installedWallets.length > 0 ? (
        <WalletSelectSection label={t('More Wallets')}>
          {installedWallets.map((wallet) => (
            <WalletSelectItem key={wallet.id} wallet={wallet} onClick={onClick} />
          ))}
        </WalletSelectSection>
      ) : null}

      <StyledButton variant="text" onClick={() => setExpanded(true)} width="100%" style={style}>
        <Flex justifyContent="space-between" width="100%" alignItems="center">
          <FlexGap alignItems="center">
            {displayWallets.map((wallet) => {
              const isImage = typeof wallet.icon === 'string'
              const Icon = wallet.icon
              return (
                <StyledWalletIcon key={wallet.id}>
                  {isImage ? (
                    <img src={Icon as string} alt={wallet.title} width={22} height={22} />
                  ) : (
                    <Icon width={22} height={22} color="textSubtle" />
                  )}
                </StyledWalletIcon>
              )
            })}
            {extraTagNum > 0 && (
              <StyledExtraTag>
                <Text fontSize="14px" color="textSubtle" fontWeight="600">
                  +{extraTagNum}
                </Text>
              </StyledExtraTag>
            )}
          </FlexGap>
          <AutoRow width="fit-content" gap="8px" alignItems="center">
            <Text fontSize="12px" color="textSubtle">
              {t('More Wallets')}
            </Text>
            <ArrowDropDownIcon width="24px" height="24px" color="textSubtle" style={{ rotate: '-90deg' }} />
          </AutoRow>
        </Flex>
      </StyledButton>
    </>
  )
}
