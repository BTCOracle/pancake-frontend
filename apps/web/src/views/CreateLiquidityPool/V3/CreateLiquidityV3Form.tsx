import { AutoColumn, Box, Card, CardBody, DynamicSection } from '@pancakeswap/uikit'
import { Protocol } from '@pancakeswap/farms'
import { useFeeLevelQueryState } from 'state/infinity/create'
import { useDebounce } from '@pancakeswap/hooks'
import { CurrencyField as Field } from 'utils/types'
import { MevProtectToggle } from 'views/Mev/MevProtectToggle'
import { FieldSelectCurrencies } from '../components/FieldSelectCurrencies'
import { FieldStartingPrice } from '../components/V3/FieldStartingPrice'
import { FieldCreateDepositAmount } from '../components/V3/FieldCreateDepositAmount'
import { FieldSlippageTolerance } from '../components/FieldSlippageTolerance'
import { useV3CreateForm } from '../hooks/V3/useV3CreateForm'
import { MessagePoolInitialized } from '../components/V3/MessagePoolInitialized'
import { FieldFeeLevel } from '../components/V3/FieldFeeLevel'

export const CreateLiquidityV3Form = () => {
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
  } = useV3CreateForm()

  const [feeLevel] = useFeeLevelQueryState()

  const poolExists_ = noLiquidity === false && !!feeLevel
  const poolExists = useDebounce(poolExists_, 400)

  const currenciesExist = currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B]

  return (
    <Box maxWidth={[null, null, null, '560px']} mx="auto">
      <Card>
        <CardBody>
          <AutoColumn gap="24px">
            <FieldSelectCurrencies />

            <DynamicSection disabled={!currenciesExist}>
              <FieldFeeLevel />
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
              <FieldSlippageTolerance />
              <MevProtectToggle />
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
