import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Box, BoxProps, FlexGap, PreTitle, useMatchBreakpoints } from '@pancakeswap/uikit'
import { CurrencySelectV2 } from 'components/CurrencySelectV2'
import { CommonBasesType } from 'components/SearchModal/types'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useCurrencies } from '../hooks/useCurrencies'
import { useFieldSelectCurrencies } from '../hooks/useFieldSelectCurrencies'

type FieldSelectCurrenciesProps = BoxProps

export const FieldSelectCurrencies: React.FC<FieldSelectCurrenciesProps> = ({ ...boxProps }) => {
  const { t } = useTranslation()
  const { chainId } = useSelectIdRouteParams()
  const { baseCurrency, quoteCurrency } = useCurrencies()
  const { handleBaseCurrencySelect, handleQuoteCurrencySelect } = useFieldSelectCurrencies()
  const { isXs } = useMatchBreakpoints()

  return (
    <Box {...boxProps}>
      <PreTitle mb="8px">{t('Choose Token Pair')}</PreTitle>
      <FlexGap gap="4px" width="100%" mb="8px" alignItems="center" flexDirection={isXs ? 'column' : 'row'}>
        <CurrencySelectV2
          id="create-liquidity-form-select-base-currency"
          chainId={chainId}
          selectedCurrency={baseCurrency}
          otherSelectedCurrency={quoteCurrency}
          onCurrencySelect={handleBaseCurrencySelect}
          showCommonBases
          commonBasesType={CommonBasesType.LIQUIDITY}
          hideBalance
        />
        <AddIcon color="textSubtle" />
        <CurrencySelectV2
          id="create-liquidity-form-select-quote-currency"
          chainId={chainId}
          selectedCurrency={quoteCurrency}
          otherSelectedCurrency={baseCurrency}
          onCurrencySelect={handleQuoteCurrencySelect}
          showCommonBases
          commonBasesType={CommonBasesType.LIQUIDITY}
          hideBalance
        />
      </FlexGap>
    </Box>
  )
}
