import { useTranslation } from '@pancakeswap/localization'
import { CheckmarkCircleIcon, ChevronRightIcon, CloseCircleIcon, Flex, FlexGap, Text } from '@pancakeswap/uikit'
import { ReactNode, useMemo } from 'react'
import semver from 'semver'
import { styled } from 'styled-components'
import { getSnapshotDeepLink } from 'views/Idos/helpers/getSnapshotLink'

export const CardWrapper = styled.div`
  background: ${({ theme }) => (theme.isDark ? '#13393C' : '#EEFBFC')};
  border: 1px solid ${({ theme }) => (theme.isDark ? '#094D53' : '#C1EDF0')};
  border-radius: 20px;

  padding: 12px;
`

export const FailureCardWrapper = styled.div`
  background: ${({ theme }) => theme.colors.failure33};
  border: 1px solid ${({ theme }) => theme.shadows.danger};
  border-radius: 20px;

  padding: 12px;
`

export const ErrorCardWrapper = styled.div`
  background: #ed4b9e1a;
  border: 1px solid ${({ theme }) => theme.colors.failure33};
  border-radius: 20px;

  padding: 12px;
`

export const PreSaleInfoCard: React.FC = () => {
  const { t } = useTranslation()

  return (
    <CardWrapper>
      <Text>
        💡{' '}
        {t(
          'Please make sure you have a keyless Binance Wallet in order to participate in this sale when the TGE goes live.',
        )}
      </Text>
    </CardWrapper>
  )
}

declare global {
  interface Window {
    bnVersion?: `${number}.${number}.${number}`
  }
}

const isDeprecatedVersion = () => {
  if (typeof window === 'undefined') return true

  const version = window.bnVersion as `${number}.${number}.${number}`

  if (!version) return true
  const isAndroid = navigator.userAgent.match(/Android/i)
  const lowestVersionForAndroid = '2.98.2'
  const lowestVersionForIOS = '2.98.3'

  if (semver.valid(version)) {
    return isAndroid ? semver.lt(version, lowestVersionForAndroid) : semver.lt(version, lowestVersionForIOS)
  }

  return true
}

export const PreSaleEligibleCard: React.FC<{ projectId: string | undefined }> = ({ projectId }) => {
  const { t } = useTranslation()
  const link = useMemo(() => {
    return getSnapshotDeepLink(projectId ?? '')
  }, [projectId])

  return (
    <CardWrapper>
      <FlexGap gap="8px" alignItems="flex-start">
        <FlexGap>
          <CheckmarkCircleIcon color="success" width="24px" />
        </FlexGap>
        <FlexGap flexDirection="column">
          <Text>{t('You are eligible to join this sale when TGE goes live!')}</Text>
          {isDeprecatedVersion() ? (
            <Text>{t('Please update to the latest APP version')}</Text>
          ) : (
            <Flex onClick={() => window.open(link)}>
              <Text color="positive60" bold>
                {t('View details')}
              </Text>
              <ChevronRightIcon color="positive60" width="24px" ml="2px" />
            </Flex>
          )}
        </FlexGap>
      </FlexGap>
    </CardWrapper>
  )
}

export const ComplianceCard: React.FC = () => {
  const { t } = useTranslation()

  return (
    <FailureCardWrapper>
      <FlexGap gap="8px" alignItems="flex-start">
        <FlexGap>
          <CloseCircleIcon color="failure" width="24px" />
        </FlexGap>
        <Text>{t('Due to regulatory requirements, you are not eligible to participate in.')}</Text>
      </FlexGap>
    </FailureCardWrapper>
  )
}

export const SnapshotNotPassCard: React.FC<{
  projectId: string | undefined
  ineligibleContent?: ReactNode
}> = ({ projectId, ineligibleContent }) => {
  const { t } = useTranslation()
  const link = useMemo(() => {
    return getSnapshotDeepLink(projectId ?? '')
  }, [projectId])

  return (
    <ErrorCardWrapper>
      <Text as="h2" fontSize="18px" bold>
        {t(`You're not eligible to participate this TGE`)}
      </Text>
      <Text color="textSubtle">
        {ineligibleContent ??
          t(
            `Unfortunately you do not meet the participation requirements this time. To qualify, participants must have purchased Binance Alpha tokens via Binance Wallet (Keyless) or through Spot/Funding accounts on Binance Exchange within the 30-day period preceding the TGE start date.`,
          )}
      </Text>
      {isDeprecatedVersion() ? (
        <Text>{t('Please update to the latest APP version')}</Text>
      ) : (
        <Flex onClick={() => window.open(link)}>
          <Text color="failure">{t('View details')}</Text>
          <ChevronRightIcon color="failure" width="24px" ml="2px" />
        </Flex>
      )}
    </ErrorCardWrapper>
  )
}
