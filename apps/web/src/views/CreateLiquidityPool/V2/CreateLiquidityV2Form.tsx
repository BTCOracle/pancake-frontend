import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Box, Card, CardBody, DynamicSection, FlexGap, PreTitle, Text } from '@pancakeswap/uikit'
import { Protocol } from '@pancakeswap/farms'
import { useStartingPriceQueryState } from 'state/infinity/create'
import { CurrencyField as Field } from 'utils/types'
import { MevProtectToggle } from 'views/Mev/MevProtectToggle'
import { useDebounce } from '@pancakeswap/hooks'
import { FieldStartingPrice } from '../components/V3/FieldStartingPrice'
import { FieldCreateDepositAmount } from '../components/V3/FieldCreateDepositAmount'
import { FieldSlippageTolerance } from '../components/FieldSlippageTolerance'
import { MessagePoolInitialized } from '../components/V3/MessagePoolInitialized'
import { useV2CreateForm } from '../hooks/V2/useV2CreateForm'
import { FieldSelectCurrencies } from '../components/FieldSelectCurrencies'

const FeeLevelCard = styled(Box)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.textSubtle};
  padding: 8px 16px;
  border-radius: 16px;
`

export const CreateLiquidityV2Form = () => {
  const { t } = useTranslation()
  const {
    // State
    currencies,
    formattedAmounts,
    maxAmounts,
    noLiquidity,

    // Components
    buttons,
    previewModal,

    // Actions
    onFieldAInput,
    onFieldBInput,
  } = useV2CreateForm()

  const poolExists_ = noLiquidity === false
  const poolExists = useDebounce(poolExists_, 400)

  const currenciesExist = currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B]

  const [startPriceTypedValue, setStartPriceTypedValue] = useStartingPriceQueryState()

  return (
    <Box maxWidth={[null, null, null, '560px']} mx="auto">
      <Card>
        <CardBody>
          <AutoColumn gap="24px">
            <FieldSelectCurrencies />

            {poolExists && currenciesExist && <MessagePoolInitialized protocol={Protocol.V2} />}

            <DynamicSection disabled={poolExists || !currenciesExist}>
              <FlexGap flexDirection={['column', 'column', 'row']} gap="8px" justifyContent="space-between">
                <Box>
                  <PreTitle>{t('Fee Level')}</PreTitle>
                  <FeeLevelCard mt="16px">
                    <Text color="invertedContrast" bold>
                      0.25%
                    </Text>
                  </FeeLevelCard>
                </Box>
                <FieldStartingPrice startPrice={startPriceTypedValue ?? ''} setStartPrice={setStartPriceTypedValue} />
              </FlexGap>
            </DynamicSection>

            <DynamicSection disabled={poolExists || !currenciesExist || !startPriceTypedValue}>
              <FieldCreateDepositAmount
                currencies={currencies}
                onFieldAInput={onFieldAInput}
                onFieldBInput={onFieldBInput}
                formattedAmounts={formattedAmounts}
                maxAmounts={maxAmounts}
                depositADisabled={false}
                depositBDisabled={false}
              />
            </DynamicSection>

            <DynamicSection disabled={poolExists || !currenciesExist || !startPriceTypedValue}>
              <FieldSlippageTolerance />
              <MevProtectToggle />
            </DynamicSection>

            <DynamicSection disabled={poolExists || !currenciesExist || !startPriceTypedValue}>
              {buttons}
            </DynamicSection>
          </AutoColumn>
        </CardBody>
      </Card>
      {previewModal}
    </Box>
  )
}
