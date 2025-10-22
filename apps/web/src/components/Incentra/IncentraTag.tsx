import { useTranslation } from '@pancakeswap/localization'
import { Tag } from '@pancakeswap/uikit'
import { useIncentraInfo } from 'hooks/useIncentra'

export function IncentraTag({ poolAddress }: { poolAddress?: string }) {
  const { hasIncentra } = useIncentraInfo(poolAddress)

  if (!hasIncentra) return null

  return (
    <Tag ml="8px" outline variant="warning">
      Incentra
    </Tag>
  )
}

export function IncentraRewardsTag({ poolAddress }: { poolAddress?: string }) {
  const { t } = useTranslation()
  const { hasIncentra } = useIncentraInfo(poolAddress)

  if (!hasIncentra) return null

  return (
    <Tag variant="warning" mr="8px" outline>
      {`Incentra ${t('Rewards')}`}
    </Tag>
  )
}
