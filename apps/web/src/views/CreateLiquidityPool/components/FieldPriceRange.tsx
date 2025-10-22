import { MAX_BIN_STEP, MIN_BIN_STEP } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Box, BoxProps, DynamicSection, PreTitle, RowBetween } from '@pancakeswap/uikit'
import { Liquidity } from '@pancakeswap/widgets-internal'
import { BinRangeSelector } from 'components/Liquidity/Form/BinRangeSelector'
import { CLRangeSelector } from 'components/Liquidity/Form/CLRangeSelector'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useCLPriceRangeCallback } from 'hooks/infinity/useCLPriceRangeCallback'
import { useMemo } from 'react'
import { useActiveIdQueryState, useBinStepQueryState, useClTickSpacingQueryState } from 'state/infinity/create'
import { isSolana } from '@pancakeswap/chains'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { useBinIdRange } from '../hooks/useBinIdRange'
import { useCurrencies } from '../hooks/useCurrencies'
import { useInfinityCreateFormQueryState } from '../hooks/useInfinityFormState/useInfinityFormQueryState'
import { useStartPriceAsFraction } from '../hooks/useStartPriceAsFraction'

export type FieldPriceRangeProps = BoxProps

export const FieldPriceRange: React.FC<FieldPriceRangeProps> = ({ ...boxProps }) => {
  const { t } = useTranslation()
  const { baseCurrency, quoteCurrency } = useCurrencies()
  const { switchCurrencies } = useSelectIdRouteParams()
  const { poolType } = useInfinityCreateFormQueryState()
  const [activeId] = useActiveIdQueryState()
  const [binStep] = useBinStepQueryState()
  const [tickSpacing] = useClTickSpacingQueryState()
  const startPriceAsFraction = useStartPriceAsFraction()
  const { minBinId, maxBinId } = useBinIdRange()

  const isBinStepValid = useMemo(() => {
    if (binStep === null) return false

    return (
      binStep >= Number(MIN_BIN_STEP) && binStep <= Number(MAX_BIN_STEP) && parseFloat(binStep.toString()) === binStep
    )
  }, [binStep])

  const baseEvm = baseCurrency && !isSolana(baseCurrency.chainId) ? (baseCurrency as unknown as Currency) : undefined
  const quoteEvm =
    quoteCurrency && !isSolana(quoteCurrency.chainId) ? (quoteCurrency as unknown as Currency) : undefined

  const { quickAction, handleQuickAction } = useCLPriceRangeCallback(
    baseEvm,
    quoteEvm,
    tickSpacing,
    startPriceAsFraction,
  )

  return (
    <Box {...boxProps}>
      <AutoColumn gap="16px">
        <RowBetween>
          <PreTitle>{t('Set Price Range')}</PreTitle>
          <Liquidity.RateToggle currencyA={baseEvm} handleRateToggle={switchCurrencies} />
        </RowBetween>
        {poolType === 'Bin' ? (
          <DynamicSection disabled={!activeId || !isBinStepValid}>
            <BinRangeSelector
              currency0={baseEvm}
              currency1={quoteEvm}
              binStep={binStep}
              activeBinId={activeId}
              minBinId={minBinId}
              maxBinId={maxBinId}
            />
          </DynamicSection>
        ) : null}
        {poolType === 'CL' ? (
          <DynamicSection disabled={!tickSpacing}>
            <CLRangeSelector
              currentPrice={startPriceAsFraction}
              baseCurrency={baseEvm}
              quoteCurrency={quoteEvm}
              tickSpacing={tickSpacing ?? undefined}
              quickAction={quickAction}
              handleQuickAction={handleQuickAction}
            />
          </DynamicSection>
        ) : null}
      </AutoColumn>
    </Box>
  )
}
