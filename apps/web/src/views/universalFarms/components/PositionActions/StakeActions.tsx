import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Button, IconButton, MinusIcon } from '@pancakeswap/uikit'

type StakeActionsProps = {
  increaseDisabled?: boolean
  decreaseDisabled?: boolean
  showIncreaseBtn?: boolean
  showDecreaseBtn?: boolean
  onIncrease: () => void
  onDecrease?: () => void
}

export const ModifyStakeActions: React.FC<StakeActionsProps> = ({
  increaseDisabled = false,
  decreaseDisabled = false,
  showIncreaseBtn = true,
  showDecreaseBtn = true,
  onIncrease,
  onDecrease,
}) => {
  return (
    <>
      {showDecreaseBtn && (
        <IconButton variant="secondary" disabled={decreaseDisabled} onClick={onDecrease}>
          <MinusIcon color="primary" width="24px" />
        </IconButton>
      )}
      {showIncreaseBtn && (
        <IconButton variant="secondary" disabled={increaseDisabled} onClick={onIncrease}>
          <AddIcon color="primary" width="24px" />
        </IconButton>
      )}
    </>
  )
}

type DepositStakeActionsProps = {
  disabled?: boolean
  onDeposit: () => void
}
export const DepositStakeAction: React.FC<DepositStakeActionsProps> = ({ disabled, onDeposit }) => {
  const { t } = useTranslation()
  return (
    <Button onClick={onDeposit} disabled={disabled}>
      {t('Stake LP')}
    </Button>
  )
}

type HarvestActionsProps = {
  onHarvest: () => void
  executing?: boolean
  disabled?: boolean
}
export const HarvestAction: React.FC<HarvestActionsProps> = ({ onHarvest, executing, disabled }) => {
  const { t } = useTranslation()
  return (
    <Button disabled={disabled} onClick={onHarvest}>
      {executing ? t('Harvesting') : t('Harvest')}
    </Button>
  )
}
