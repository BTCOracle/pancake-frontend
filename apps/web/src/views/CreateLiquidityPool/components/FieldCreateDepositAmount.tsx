import { Box, BoxProps } from '@pancakeswap/uikit'
import { FieldDepositAmount } from 'components/Liquidity/Form/FieldDepositAmount'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { isSolana } from '@pancakeswap/chains'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { useCreateDepositAmounts, useCreateDepositAmountsEnabled } from '../hooks/useCreateDepositAmounts'
import { useCurrencies } from '../hooks/useCurrencies'

type FieldDepositAmountProps = BoxProps

export const FieldCreateDepositAmount: React.FC<FieldDepositAmountProps> = ({ ...boxProps }) => {
  const { chainId } = useSelectIdRouteParams()
  const { baseCurrency, quoteCurrency } = useCurrencies()
  const baseEvm = baseCurrency && !isSolana(baseCurrency.chainId) ? (baseCurrency as unknown as Currency) : undefined
  const quoteEvm =
    quoteCurrency && !isSolana(quoteCurrency.chainId) ? (quoteCurrency as unknown as Currency) : undefined
  const { handleDepositAmountChange, inputValue0, inputValue1 } = useCreateDepositAmounts()

  const { isDeposit0Enabled, isDepositEnabled, isDeposit1Enabled } = useCreateDepositAmountsEnabled()

  return (
    <Box>
      <FieldDepositAmount
        {...boxProps}
        chainId={chainId}
        baseCurrency={baseEvm}
        quoteCurrency={quoteEvm}
        handleDepositAmountChange={handleDepositAmountChange}
        inputValue0={inputValue0}
        inputValue1={inputValue1}
        isDepositEnabled={isDepositEnabled}
        isDeposit0Enabled={isDeposit0Enabled}
        isDeposit1Enabled={isDeposit1Enabled}
      />
    </Box>
  )
}
