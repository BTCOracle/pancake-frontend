import { useTranslation } from '@pancakeswap/localization'
import { useTooltip } from '@pancakeswap/uikit'
import { FarmWidget } from '@pancakeswap/widgets-internal'

const { CompoundingPoolTag, ManualPoolTag, LockedPoolTag, LockedOrAutoPoolTag } = FarmWidget.Tags

const PoolTypeTag = ({ account, isLocked, children }) => {
  const { t } = useTranslation()

  const tooltipText = t('You must harvest and compound your earnings from this pool manually.')

  const { targetRef, tooltip, tooltipVisible } = useTooltip(tooltipText, {
    placement: 'bottom',
  })

  return (
    <>
      <ManualPoolTag />
      {tooltipVisible && tooltip}
      {children(targetRef)}
    </>
  )
}

export default PoolTypeTag
