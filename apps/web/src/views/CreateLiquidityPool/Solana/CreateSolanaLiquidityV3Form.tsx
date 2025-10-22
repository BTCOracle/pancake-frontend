import { useMemo } from 'react'
import { AutoColumn, Box, Card, CardBody, DynamicSection } from '@pancakeswap/uikit'
import { Protocol } from '@pancakeswap/farms'
import { useFeeLevelQueryState } from 'state/infinity/create'
import { CurrencyField as Field } from 'utils/types'
import { FieldSelectCurrencies } from '../components/FieldSelectCurrencies'
import { FieldStartingPrice } from '../components/V3/FieldStartingPrice'
import { FieldCreateDepositAmount } from '../components/V3/FieldCreateDepositAmount'
import { MessagePoolInitialized } from '../components/V3/MessagePoolInitialized'
import { FieldFeeLevel } from '../components/V3/FieldFeeLevel'
import { useSolanaV3CreateForm } from '../hooks/useSolanaV3CreateForm'

export const CreateSolanaLiquidityV3Form = () => {
  const {
    // State
    currencies,
    leftRangeTypedValue,
    rightRangeTypedValue,
    startPriceTypedValue,
    formattedAmounts,
    maxAmounts,
    depositADisabled,
    depositBDisabled,
    noLiquidity,

    // Components
    buttons,
    rangeSelector,
    previewModal,

    // Actions
    onStartPriceInput,
    onFieldAInput,
    onFieldBInput,
    switchCurrencies,
  } = useSolanaV3CreateForm()

  const [feeLevel] = useFeeLevelQueryState()
  const poolExists = useMemo(() => noLiquidity === false && !!feeLevel, [feeLevel, noLiquidity])
  const currenciesExist = currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B]
  const { [Field.CURRENCY_A]: currency0, [Field.CURRENCY_B]: currency1 } = currencies

  return (
    <Box maxWidth={[null, null, null, '560px']} mx="auto">
      <Card>
        <CardBody>
          <AutoColumn gap="24px">
            <FieldSelectCurrencies />

            <DynamicSection disabled={!currenciesExist}>
              <FieldFeeLevel baseCurrency={currency0} quoteCurrency={currency1} feeAmount={feeLevel ?? undefined} />
            </DynamicSection>

            {poolExists && currenciesExist && <MessagePoolInitialized protocol={Protocol.V3} />}

            <DynamicSection disabled={poolExists || !currenciesExist}>
              <FieldStartingPrice
                startPrice={startPriceTypedValue}
                setStartPrice={onStartPriceInput}
                switchCurrencies={switchCurrencies}
              />
            </DynamicSection>
            <DynamicSection disabled={poolExists || !currenciesExist || !startPriceTypedValue || !feeLevel}>
              {rangeSelector}
            </DynamicSection>

            <DynamicSection
              disabled={
                poolExists ||
                !currenciesExist ||
                !startPriceTypedValue ||
                !feeLevel ||
                !leftRangeTypedValue ||
                !rightRangeTypedValue
              }
            >
              <FieldCreateDepositAmount
                currencies={currencies}
                onFieldAInput={onFieldAInput}
                onFieldBInput={onFieldBInput}
                formattedAmounts={formattedAmounts}
                maxAmounts={maxAmounts}
                depositADisabled={depositADisabled}
                depositBDisabled={depositBDisabled}
              />
            </DynamicSection>

            <DynamicSection
              disabled={
                poolExists ||
                !currenciesExist ||
                !startPriceTypedValue ||
                !feeLevel ||
                !leftRangeTypedValue ||
                !rightRangeTypedValue
              }
            >
              {buttons}
            </DynamicSection>
          </AutoColumn>
        </CardBody>
      </Card>
      {previewModal}
    </Box>
  )
}
