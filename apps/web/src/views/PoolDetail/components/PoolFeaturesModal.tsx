import { HookData } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import {
  AutoColumn,
  AutoRow,
  Button,
  FlexGap,
  GithubIcon as GithubIconComponent,
  Heading,
  Link,
  MiscellaneousIcon,
  Modal,
  ModalV2,
  OpenNewIcon,
  PreTitle,
  Text,
  useMatchBreakpoints,
  useModalV2,
} from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { Liquidity } from '@pancakeswap/widgets-internal'
import { PropsWithChildren, useMemo } from 'react'
import { getBlockExploreLink } from 'utils'
import { UnifiedChainId } from '@pancakeswap/chains'

const HookInfoItem = ({
  label,
  href,
  text,
  icon,
  external,
}: {
  label: string
  href: string
  text: string
  icon: React.ReactNode
  external?: boolean
}) => (
  <AutoRow gap="sm" justifyContent="space-between">
    <PreTitle bold={false} fontSize="16px" color="textSubtle" textTransform="capitalize">
      {label}
    </PreTitle>
    <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      <Button scale="sm" variant="text" width="fit-content" px="0">
        <Text fontSize="16px" color="primary60" bold>
          {text}
        </Text>
        {icon}
      </Button>
    </Link>
  </AutoRow>
)

interface PoolFeaturesModalProps {
  hookData?: HookData
  chainId?: UnifiedChainId
}

export const PoolFeaturesModal = ({ hookData, chainId, children }: PropsWithChildren<PoolFeaturesModalProps>) => {
  const { t } = useTranslation()
  const modalV2Props = useModalV2()
  const { isMobile } = useMatchBreakpoints()

  const forwardIcon = useMemo(() => <OpenNewIcon ml="8px" width="24px" color="primary60" />, [])
  const githubIcon = useMemo(() => <GithubIconComponent ml="8px" width="24px" color="primary60" />, [])

  if (!hookData || !chainId) {
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={modalV2Props.onOpen}
        style={{ cursor: 'pointer', border: 'none', background: 'none' }}
      >
        {children}
      </button>
      <ModalV2 {...modalV2Props} closeOnOverlayClick>
        <Modal
          title={
            <FlexGap gap="4px" alignItems="center">
              <MiscellaneousIcon width={36} height={36} color="textSubtle" />
              {t('Pool Features')}
            </FlexGap>
          }
          maxWidth={isMobile ? '100%' : '480px'}
          onDismiss={modalV2Props.onDismiss}
        >
          <AutoColumn gap="lg" flex={1}>
            <FlexGap gap="sm" alignItems="center">
              <Heading scale="lg">{hookData.name}</Heading>
            </FlexGap>
            <AutoColumn gap="sm">
              <PreTitle>{t('Description')}</PreTitle>
              <Liquidity.LinkifyText text={hookData.description} />
            </AutoColumn>
          </AutoColumn>

          <AutoColumn mt="16px" flex={1} gap="md">
            <PreTitle>{t('Links')}</PreTitle>
            {hookData.address && (
              <HookInfoItem
                label={t('Hook Address')}
                text={truncateHash(hookData.address)}
                icon={forwardIcon}
                external
                href={getBlockExploreLink(hookData.address, 'address', chainId)}
              />
            )}
            {hookData.github && (
              <HookInfoItem label={t('Github')} text={t('View Details')} icon={githubIcon} href={hookData.github} />
            )}
            {hookData.audit && (
              <HookInfoItem
                label={t('Audit info')}
                text={t('Audit Outcome')}
                icon={forwardIcon}
                href={hookData.audit}
              />
            )}
            {hookData.creator && (
              <HookInfoItem
                label={t('Hook Creator')}
                text={t('View Details')}
                icon={githubIcon}
                href={hookData.creator}
              />
            )}
          </AutoColumn>
        </Modal>
      </ModalV2>
    </>
  )
}
