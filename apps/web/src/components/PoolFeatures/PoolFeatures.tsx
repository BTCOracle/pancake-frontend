import { HookData } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import {
  AutoColumn,
  AutoRow,
  Button,
  Card,
  CardBody,
  FlexGap,
  GithubIcon as GithubIconComponent,
  Heading,
  MiscellaneousIcon,
  OpenNewIcon,
  PreTitle,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { Liquidity } from '@pancakeswap/widgets-internal'
import Link from 'next/link'
import { useMemo } from 'react'

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

export const PoolFeatures = ({ hookData }: { hookData: HookData }) => {
  const { t } = useTranslation()
  const forwardIcon = useMemo(() => <OpenNewIcon ml="8px" width="24px" color="primary60" />, [])
  const githubIcon = useMemo(() => <GithubIconComponent ml="8px" width="24px" color="primary60" />, [])
  const { isMobile } = useMatchBreakpoints()

  return (
    <Card style={{ overflow: 'visible' }}>
      <CardBody>
        <FlexGap flexDirection={isMobile ? 'column' : 'row'} gap="24px">
          <AutoColumn gap="lg" flex={1}>
            <FlexGap gap="sm" alignItems="center">
              <MiscellaneousIcon width={36} height={36} color="textSubtle" />
              <Heading scale="lg">{hookData.name}</Heading>
            </FlexGap>
            <AutoColumn gap="sm">
              <PreTitle>{t('Description')}</PreTitle>
              <Liquidity.LinkifyText text={hookData.description} />
            </AutoColumn>
          </AutoColumn>

          <AutoColumn flex={1} gap="md">
            <PreTitle>{t('Links')}</PreTitle>
            {hookData.address && (
              <HookInfoItem
                label={t('Hook Address')}
                text={truncateHash(hookData.address)}
                icon={forwardIcon}
                external
                href={`https://bscscan.com/address/${hookData.address}`}
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
        </FlexGap>
      </CardBody>
    </Card>
  )
}
