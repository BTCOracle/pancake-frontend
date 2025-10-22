import { type HookData } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import {
  Button,
  CopyButton,
  FlexGap,
  IconButton,
  Link,
  OpenNewIcon,
  Text,
  TextProps,
  useModalV2,
} from '@pancakeswap/uikit'
import { scales } from '@pancakeswap/uikit/components/Button/types'
import Divider from 'components/Divider'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useHooksList } from 'hooks/infinity/useHooksList'
import { PropsWithChildren, useCallback } from 'react'
import { usePoolTypeQueryState } from 'state/infinity/create'

import { UpgradableStatusBadge, VerifiedBadge } from './HookBadges'
import { HookListModal } from './HookListModal'
import { HookChangeCb, useSelectHookFromList } from './hooks/useSelectHookFromList'
import { HookTags } from './HookTags'

interface HookProps {
  selectedHook?: HookData
}

const Title = (props: PropsWithChildren<TextProps>) => (
  <Text color="#7A6EAA" fontSize="12px" bold textTransform="uppercase" {...props} />
)

export const HookName = ({ selectedHook }: HookProps) => {
  const { t } = useTranslation()
  const link = selectedHook?.learnMoreLink ?? selectedHook?.github

  return selectedHook?.name ? (
    <FlexGap flexDirection="column" gap="8px">
      <FlexGap justifyContent="space-between" alignItems="center">
        <Title>{t('Hook Name')}</Title>
        {link && (
          <Link href={link} target="_blank" rel="noopener noreferrer">
            <IconButton scale="xs" variant="textPrimary60">
              {t('Hook details')}
              <OpenNewIcon ml="4px" color="primary60" width="18px" />
            </IconButton>
          </Link>
        )}
      </FlexGap>
      <Text>{selectedHook.name}</Text>
    </FlexGap>
  ) : null
}

export const HookTagsComponent = ({ selectedHook }: HookProps) => (
  <FlexGap gap="8px" flexWrap="wrap">
    <HookTags hook={selectedHook} />
  </FlexGap>
)

interface HookAddressProps {
  address?: HookData['address']
}

export const HookAddress: React.FC<React.PropsWithChildren<HookAddressProps>> = ({ address = '', children }) => {
  const { t } = useTranslation()
  return (
    <FlexGap flexDirection="column" gap="8px">
      <FlexGap justifyContent="space-between" alignItems="center">
        <Title>{t('Hook Address')}</Title>
        <CopyButton text={address} tooltipMessage={t('Copied to clipboard')} buttonColor="primary60">
          <Text color="primary60" bold fontSize="12px" mr="4px">
            {t('Copy address')}
          </Text>
        </CopyButton>
      </FlexGap>
      {children ?? (
        <Text
          style={{
            wordBreak: 'break-all',
          }}
        >
          {address}
        </Text>
      )}
    </FlexGap>
  )
}

export const HookVerification = ({ selectedHook }: HookProps) =>
  selectedHook ? (
    <FlexGap gap="8px">
      <VerifiedBadge isVerified={selectedHook?.isVerified} showNonVerified />
      {selectedHook?.isVerified && <UpgradableStatusBadge isUpgradable={selectedHook.isUpgradable} />}
    </FlexGap>
  ) : null

export const Action = ({ selectedHook, onOpen }: HookProps & { onOpen: () => void }) => {
  const { t } = useTranslation()
  const buttonProps = {
    scale: scales.MD,
    width: '100%',
    onClick: onOpen,
  }

  return (
    <FlexGap flexDirection="column" gap="8px">
      <Title>{t('Import from List')}</Title>
      {selectedHook ? (
        <Button variant="secondary" {...buttonProps}>
          {t('Change Hook')}
        </Button>
      ) : (
        <Button variant="primary" {...buttonProps}>
          {t('Select Hook')}
        </Button>
      )}
    </FlexGap>
  )
}

export const HookSettingsList = ({ onHookChange }: { onHookChange?: HookChangeCb }) => {
  const modalState = useModalV2()
  const { onDismiss, onOpen } = modalState
  const { chainId } = useSelectIdRouteParams()
  const [selectedHook, setSelectedHook] = useSelectHookFromList(onHookChange)
  const [poolType] = usePoolTypeQueryState()
  const hooksList = useHooksList(chainId, poolType)

  const handleItemClick = useCallback(
    (item: HookData) => {
      setSelectedHook(item)
      onDismiss()
    },
    [onDismiss, setSelectedHook],
  )

  return (
    <FlexGap gap="8px" flexDirection="column">
      {selectedHook ? (
        <>
          <HookName selectedHook={selectedHook} />
          <HookTagsComponent selectedHook={selectedHook} />
          <Divider />
          <HookAddress address={selectedHook.address} />
          <HookVerification selectedHook={selectedHook} />
          <Divider />
        </>
      ) : null}
      <Action selectedHook={selectedHook} onOpen={onOpen} />
      {modalState.isOpen ? <HookListModal {...modalState} data={hooksList} onItemClick={handleItemClick} /> : null}
    </FlexGap>
  )
}
