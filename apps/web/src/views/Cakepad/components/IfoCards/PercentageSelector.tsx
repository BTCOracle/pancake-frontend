import { useTranslation } from '@pancakeswap/localization'
import { Button, FlexGap } from '@pancakeswap/uikit'
import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'

interface PercentageSelectorProps {
  maxAmountInput?: CurrencyAmount<Currency>
  value: string
  onPercent: (percent: number) => void
  getPercentAmount: (percent: number) => CurrencyAmount<Currency>
}

const PercentageSelector: React.FC<PercentageSelectorProps> = ({
  maxAmountInput,
  value,
  onPercent,
  getPercentAmount,
}) => {
  const { t } = useTranslation()

  if (!maxAmountInput?.greaterThan(0)) return null

  return (
    <FlexGap gap="8px" borderColor="primary" borderRadius="8px" width="100%" p="4px">
      {[25, 50, 75, 100].map((percent) => {
        const isAtCurrentPercent = maxAmountInput && value !== '0' && value === getPercentAmount(percent).toExact()
        return (
          <Button
            key={`btn_quickCurrency${percent}`}
            data-dd-action-name={`Balance percent ${percent}`}
            onClick={() => onPercent(percent)}
            scale="sm"
            variant={isAtCurrentPercent ? 'primary' : 'secondary'}
            display="flex"
            p="4px"
            border="2px solid"
            style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: 600, flex: 1 }}
          >
            {percent === 100 ? t('Max.fill-max') : `${percent}%`}
          </Button>
        )
      })}
    </FlexGap>
  )
}

export default PercentageSelector
