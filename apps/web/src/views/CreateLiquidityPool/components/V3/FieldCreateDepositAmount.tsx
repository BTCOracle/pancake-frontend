import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Box, BoxProps, PreTitle } from '@pancakeswap/uikit'
import { CurrencyField as Field } from 'utils/types'
import { UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Percent } from '@pancakeswap/sdk'

import LockedDeposit from 'views/AddLiquidityV3/formViews/V3FormView/components/LockedDeposit'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'

type FieldDepositAmountProps = {
  currencies: { [field in Field]?: UnifiedCurrency }
  onFieldAInput: (value: string) => void
  onFieldBInput: (value: string) => void
  formattedAmounts: { [field in Field]?: string }
  maxAmounts: { [field in Field]?: UnifiedCurrencyAmount<UnifiedCurrency> }
  depositADisabled: boolean
  depositBDisabled: boolean
} & BoxProps

export const FieldCreateDepositAmount: React.FC<FieldDepositAmountProps> = ({
  currencies,
  onFieldAInput,
  onFieldBInput,
  formattedAmounts,
  maxAmounts,
  depositADisabled,
  depositBDisabled,
  ...boxProps
}) => {
  const { t } = useTranslation()

  return (
    <Box {...boxProps}>
      <AutoColumn gap="8px">
        <LockedDeposit locked={depositADisabled}>
          <CurrencyInputPanelSimplify
            showUSDPrice
            maxAmount={maxAmounts[Field.CURRENCY_A]}
            onMax={() => onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')}
            onPercentInput={(percent) =>
              onFieldAInput(maxAmounts[Field.CURRENCY_A]?.multiply(new Percent(percent, 100))?.toExact() ?? '')
            }
            disableCurrencySelect
            defaultValue={formattedAmounts[Field.CURRENCY_A] ?? '0'}
            onUserInput={onFieldAInput}
            showQuickInputButton
            showMaxButton
            currency={currencies[Field.CURRENCY_A]}
            id="create-pool-input-tokena"
            title={<PreTitle>{t('Deposit Amount')}</PreTitle>}
          />
        </LockedDeposit>

        <LockedDeposit locked={depositBDisabled}>
          <CurrencyInputPanelSimplify
            showUSDPrice
            maxAmount={maxAmounts[Field.CURRENCY_B]}
            onMax={() => onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')}
            onPercentInput={(percent) =>
              onFieldBInput(maxAmounts[Field.CURRENCY_B]?.multiply(new Percent(percent, 100))?.toExact() ?? '')
            }
            disableCurrencySelect
            defaultValue={formattedAmounts[Field.CURRENCY_B] ?? '0'}
            onUserInput={onFieldBInput}
            showQuickInputButton
            showMaxButton
            currency={currencies[Field.CURRENCY_B]}
            id="create-pool-input-tokenb"
            title={<>&nbsp;</>}
          />
        </LockedDeposit>
      </AutoColumn>
    </Box>
  )
}
