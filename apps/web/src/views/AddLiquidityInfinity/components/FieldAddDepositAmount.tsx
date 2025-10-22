import { useMemo } from 'react'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { BoxProps, RowBetween, Column, Text, SkeletonV2, Skeleton } from '@pancakeswap/uikit'
import { FieldDepositAmount } from 'components/Liquidity/Form/FieldDepositAmount'
import { useInfinityPoolIdRouteParams } from 'hooks/dynamicRoute/usePoolIdRoute'
import { useInverted } from 'state/infinity/shared'
import { useTranslation } from '@pancakeswap/localization'
import { LiquiditySlippageButton } from 'views/Swap/components/SlippageButton'
import { useTotalUsdValue } from 'views/AddLiquidity/hooks/useTotalUsdValue'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useAddDepositAmounts, useAddDepositAmountsEnabled } from '../hooks/useAddDepositAmounts'

type FieldDepositAmountProps = BoxProps & {
  baseCurrency: Currency | undefined
  quoteCurrency: Currency | undefined
}

export const FieldAddDepositAmount: React.FC<FieldDepositAmountProps> = ({
  baseCurrency,
  quoteCurrency,
  ...boxProps
}) => {
  const { t } = useTranslation()
  const { chainId } = useInfinityPoolIdRouteParams()
  const { inputValue0, inputValue1, handleDepositAmountChange } = useAddDepositAmounts()
  const { isDepositEnabled, isDeposit0Enabled, isDeposit1Enabled } = useAddDepositAmountsEnabled()
  const [inverted] = useInverted()

  const input0 = useMemo(() => (inverted ? inputValue1 : inputValue0), [inverted, inputValue0, inputValue1])
  const input1 = useMemo(() => (inverted ? inputValue0 : inputValue1), [inverted, inputValue0, inputValue1])

  const parsedAmountA = useMemo(() => tryParseAmount(input0, baseCurrency), [input0, baseCurrency])
  const parsedAmountB = useMemo(() => tryParseAmount(input1, quoteCurrency), [input1, quoteCurrency])

  const { totalUsdValue } = useTotalUsdValue({
    parsedAmountA,
    parsedAmountB,
  })

  // NOTE: FieldAddDepositAmount is only used in Add Liquidity page,
  // so we can assume that baseCurrency and quoteCurrency are always available
  return (
    <>
      {baseCurrency && quoteCurrency ? (
        <FieldDepositAmount
          {...boxProps}
          addOnly
          chainId={chainId}
          baseCurrency={baseCurrency}
          quoteCurrency={quoteCurrency}
          handleDepositAmountChange={handleDepositAmountChange}
          inputValue0={inputValue0}
          inputValue1={inputValue1}
          isDeposit0Enabled={isDeposit0Enabled}
          isDepositEnabled={isDepositEnabled}
          isDeposit1Enabled={isDeposit1Enabled}
        />
      ) : (
        <Skeleton height="220px" width="100%" />
      )}

      <Column mt="16px" gap="16px">
        <RowBetween>
          <Text color="textSubtle">{t('Total.amount')}</Text>
          <Text>
            ~
            {formatDollarAmount(
              isDepositEnabled && (isDeposit0Enabled || isDeposit1Enabled) ? totalUsdValue : 0,
              2,
              false,
            )}
          </Text>
        </RowBetween>
        <RowBetween>
          <Text color="textSubtle">{t('Slippage Tolerance')}</Text>
          <LiquiditySlippageButton />
        </RowBetween>
      </Column>
    </>
  )
}
