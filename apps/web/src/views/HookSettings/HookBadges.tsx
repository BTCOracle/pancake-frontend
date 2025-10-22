import { useTranslation } from '@pancakeswap/localization'
import { Box, CheckmarkIcon, LockIcon, useTooltip } from '@pancakeswap/uikit'
import styled from 'styled-components'

const Badge = styled(Box)`
  border-radius: 999px;
  font-size: 14px;
  padding: 4px 8px;
  width: fit-content;
  display: flex;
  align-items: center;
  user-select: none;
`

interface VerifiedBadgeProps {
  isVerified?: boolean
  showNonVerified?: boolean
}

export const VerifiedBadge = ({ isVerified, showNonVerified = false }: VerifiedBadgeProps) => {
  const { t } = useTranslation()

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    isVerified ? t('Contract is verified on block explorer') : t('Contract is not verified on block explorer'),
  )

  if (!isVerified && !showNonVerified) {
    return null
  }

  return (
    <Badge
      ref={targetRef}
      backgroundColor={isVerified ? 'success' : 'disabled'}
      color={isVerified ? 'background' : 'inverted'}
    >
      {isVerified ? (
        <>
          {t('Verified')}
          <CheckmarkIcon width="14px" color="background" ml="3px" />
        </>
      ) : (
        t('Non-Verified')
      )}
      {tooltipVisible && tooltip}
    </Badge>
  )
}

interface UpgradableStatusBadgeProps {
  isUpgradable?: boolean
}
export const UpgradableStatusBadge = ({ isUpgradable }: UpgradableStatusBadgeProps) => {
  const { t } = useTranslation()

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    isUpgradable
      ? t(
          'Contract is designed to be upgradeable. Future behavior may differ from current implementation. Select at your own risk',
        )
      : t('Contract is not upgradeable. You can expect consistent behavior over time'),
  )

  return (
    <Badge
      ref={targetRef}
      backgroundColor={isUpgradable ? 'failure' : 'success'}
      color={isUpgradable ? 'background' : 'background'}
    >
      {isUpgradable ? (
        <>{t('Upgradable')}</>
      ) : (
        <>
          {t('Non-upgradable')} <LockIcon color="background" ml="3px" />
        </>
      )}
      {tooltipVisible && tooltip}
    </Badge>
  )
}
