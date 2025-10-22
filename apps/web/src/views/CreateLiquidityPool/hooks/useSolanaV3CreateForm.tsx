import { useV3FormState } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'
import { useSolanaDerivedInfo } from 'hooks/solana/useSolanaDerivedInfo'
import { useFeeLevelQueryState } from 'state/infinity/create'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useV3MintActionHandlers } from 'views/AddLiquidityV3/formViews/V3FormView/form/hooks/useV3MintActionHandlers'
import { tryParsePrice } from 'hooks/v3/utils'
import { SolanaSubmitButton } from 'views/CreateLiquidityPool/components/Solana/SolanaSubmitButton'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useTranslation } from '@pancakeswap/localization'
import { SPLToken, UnifiedCurrency, UnifiedCurrencyAmount, isUnifiedCurrencySorted } from '@pancakeswap/swap-sdk-core'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { CurrencyField as Field } from 'utils/types'
import { maxUnifiedAmountSpend } from 'utils/maxAmountSpend'
import { useRouter } from 'next/router'
import {
  logGTMAddLiquidityTxSentEvent,
  logGTMClickAddLiquidityConfirmEvent,
  logGTMClickAddLiquidityEvent,
} from 'utils/customGTMEventTracking'
import { useIsExpertMode } from '@pancakeswap/utils/user'

import { RangeSelector as V3RangeSelector } from 'views/AddLiquidityV3/formViews/SolanaFormView/RangeSelector'
import { Bound, ZoomLevels } from '@pancakeswap/widgets-internal'
import {
  AutoColumn,
  Box,
  Button,
  FlexGap,
  IconButton,
  Message,
  MessageText,
  PreTitle,
  RowBetween,
  SwapHorizIcon,
  Text,
  useModal,
  useModalV2,
} from '@pancakeswap/uikit'

import { priceToClosestTick } from '@pancakeswap/v3-sdk'

import { formatPreviewPrice } from 'views/CreateLiquidityPool/utils'
import { PreviewModal } from 'views/CreateLiquidityPool/components/PreviewModal'
import { QUICK_ACTION_CONFIGS } from 'views/AddLiquidityV3/types'
import { formatRawAmount } from 'utils/formatCurrencyAmount'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useCreateClmmPool } from 'hooks/solana/useCreateClmmPool'
import { useCreatePosition } from 'hooks/solana/useCreatePosition'
import { ErrorModal } from 'views/AddLiquidityInfinity/components/ErrorModal'
import { useCurrencies } from './useCurrencies'
import { useSolanaRangeHopCallbacks } from './useRangeHopCallbacks'

export const useSolanaV3CreateForm = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { solanaAccount: account, isWrongNetwork } = useAccountActiveChain()
  const { onOpen: onOpenPreviewModal, isOpen: isPreviewModalOpen, onDismiss: onDismissPreviewModal } = useModalV2()

  // User Settings
  const expertMode = useIsExpertMode()

  // Shared Create Liquidity State
  const { switchCurrencies: switchCurrenciesRoute } = useSelectIdRouteParams()
  const { baseCurrency, quoteCurrency } = useCurrencies()

  const [feeAmount] = useFeeLevelQueryState()

  // V3 Form State
  const [txHash, setTxHash] = useState<string>('')
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txnErrorMessage, setTxnErrorMessage] = useState<string | undefined>()
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState<boolean>(false)
  const [activeQuickAction, setActiveQuickAction] = useState<number>()
  const isQuickButtonUsed = useRef(false)
  const [quickAction, setQuickAction] = useState<number | null>(null)
  const [customZoomLevel, setCustomZoomLevel] = useState<ZoomLevels | undefined>(undefined)

  const [onPresentErrorModal] = useModal(
    <ErrorModal title={t('Add Liquidity')} subTitle={txnErrorMessage} />,
    true,
    true,
    'solana-clmm-add-liquidity-error-modal',
  )
  const formState = useV3FormState()
  const { independentField, typedValue, startPriceTypedValue, leftRangeTypedValue, rightRangeTypedValue } = formState

  const {
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    parsedAmounts,
    currencyBalances,
    noLiquidity,
    currencies,
    errorMessage,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    tickSpaceLimits,
    pool,
  } = useSolanaDerivedInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount ?? undefined,
    baseCurrency ?? undefined,
    undefined,
    formState,
  )

  const addTransaction = useTransactionAdder()

  // Currency validation
  const addIsWarning = false
  const addIsUnsupported = false
  const isValid = !errorMessage && !invalidRange

  // Derivative States
  // Formatted amounts for input fields
  const formattedAmounts = useMemo(() => {
    return {
      [independentField]: typedValue,
      [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }
  }, [independentField, typedValue, dependentField, parsedAmounts])

  // Get the max amounts user can add
  const maxAmounts: { [field in Field]?: UnifiedCurrencyAmount<UnifiedCurrency> } = useMemo(
    () =>
      [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
        return {
          ...accumulator,
          [field]: maxUnifiedAmountSpend(currencyBalances[field]),
        }
      }, {}),
    [currencyBalances],
  )

  // TICKS
  // Value and Prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const isSorted = useMemo(
    () => (baseCurrency && quoteCurrency ? isUnifiedCurrencySorted(baseCurrency, quoteCurrency) : false),
    [baseCurrency, quoteCurrency],
  )

  const rangeLeftValue = useMemo(() => {
    if (ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return '0'

    if (
      tickSpaceLimits?.[Bound.LOWER] !== undefined &&
      priceLower &&
      priceToClosestTick(priceLower) <= tickSpaceLimits[Bound.LOWER]
    ) {
      return '0'
    }

    return formatPreviewPrice(priceLower)
  }, [isSorted, priceLower, tickSpaceLimits, ticksAtLimit])

  const rangeRightValue = useMemo(() => {
    if (ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return '∞'

    if (
      tickSpaceLimits?.[Bound.LOWER] !== undefined &&
      priceUpper &&
      priceToClosestTick(priceUpper) <= tickSpaceLimits[Bound.LOWER]
    ) {
      return '0'
    }

    if (
      tickSpaceLimits?.[Bound.UPPER] !== undefined &&
      priceUpper &&
      priceToClosestTick(priceUpper) >= tickSpaceLimits[Bound.UPPER]
    ) {
      return '∞'
    }

    return formatPreviewPrice(priceUpper)
  }, [isSorted, priceUpper, tickSpaceLimits, ticksAtLimit])

  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput, onBothRangeInput } =
    useV3MintActionHandlers(noLiquidity, false)

  // Enhanced switchCurrencies that also inverts range values and swaps deposit amounts
  const switchCurrencies = useCallback(() => {
    // First, switch the currencies in the route
    switchCurrenciesRoute()

    // Invert the range values to maintain the same price ranges
    if (
      leftRangeTypedValue &&
      rightRangeTypedValue &&
      typeof leftRangeTypedValue !== 'boolean' &&
      typeof rightRangeTypedValue !== 'boolean'
    ) {
      const invertedLeft = rightRangeTypedValue.invert()
      const invertedRight = leftRangeTypedValue.invert()

      onBothRangeInput({
        leftTypedValue: invertedLeft,
        rightTypedValue: invertedRight,
      })
    }

    // Switch the deposit amounts
    onFieldAInput(parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '')
    onFieldBInput(parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '')
  }, [
    switchCurrenciesRoute,
    leftRangeTypedValue,
    rightRangeTypedValue,
    onBothRangeInput,
    parsedAmounts,
    onFieldAInput,
    onFieldBInput,
  ])

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useSolanaRangeHopCallbacks(
      baseCurrency ?? undefined,
      quoteCurrency ?? undefined,
      feeAmount,
      tickLower,
      tickUpper,
      pool,
    )

  const onBothRangePriceInput = useCallback(
    (leftRangeValue: string, rightRangeValue: string) => {
      onBothRangeInput({
        leftTypedValue: tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, leftRangeValue),
        rightTypedValue: tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, rightRangeValue),
      })
    },
    [baseCurrency, quoteCurrency, onBothRangeInput],
  )

  const onLeftRangePriceInput = useCallback(
    (leftRangeValue: string) => {
      onLeftRangeInput(tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, leftRangeValue))
    },
    [onLeftRangeInput, baseCurrency, quoteCurrency],
  )

  const onRightRangePriceInput = useCallback(
    (rightRangeValue: string) => {
      onRightRangeInput(tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, rightRangeValue))
    },
    [onRightRangeInput, baseCurrency, quoteCurrency],
  )

  // Range refresh function to set ranges based on zoom levels
  const handleRefresh = useCallback(
    (zoomLevel?: ZoomLevels) => {
      setActiveQuickAction(undefined)
      if (!zoomLevel) {
        setCustomZoomLevel(undefined)
        return
      }
      const currentPrice = price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined
      if (currentPrice) {
        const leftRangeValue = currentPrice * zoomLevel.initialMin
        const rightRangeValue = currentPrice * zoomLevel.initialMax

        onBothRangePriceInput(leftRangeValue.toString(), rightRangeValue.toString())
      }
    },
    [price, invertPrice, onBothRangePriceInput],
  )

  const handleQuickAction = useCallback(
    (value: number | null, zoomLevel: ZoomLevels) => {
      setQuickAction(value)
      if (value !== null) {
        // Check if it's a full range action (100)
        if (value === 100) {
          setCustomZoomLevel(undefined)
          setShowCapitalEfficiencyWarning(true)
          setActiveQuickAction(100)
          isQuickButtonUsed.current = true
        } else {
          const isPredefinedAction = feeAmount && QUICK_ACTION_CONFIGS[feeAmount]?.[value]

          if (isPredefinedAction) {
            setCustomZoomLevel(undefined)
            handleRefresh(QUICK_ACTION_CONFIGS[feeAmount][value])
            setActiveQuickAction(value)
            isQuickButtonUsed.current = true
          } else {
            setCustomZoomLevel(zoomLevel)
            handleRefresh(zoomLevel)
            setActiveQuickAction(value)
            isQuickButtonUsed.current = true
          }
        }
      }
    },
    [feeAmount, handleRefresh, setShowCapitalEfficiencyWarning],
  )

  const createClmm = useCreateClmmPool()
  const addLiquidity = useCreatePosition()

  const addedCallback = useCallback(
    (hash: string) => {
      setAttemptingTxn(false)
      logGTMAddLiquidityTxSentEvent()
      setTxHash(hash)
      const baseAmount = baseCurrency
        ? formatRawAmount(parsedAmounts[Field.CURRENCY_A]?.quotient?.toString() ?? '0', baseCurrency.decimals, 4)
        : 0
      const quoteAmount = quoteCurrency
        ? formatRawAmount(parsedAmounts[Field.CURRENCY_B]?.quotient?.toString() ?? '0', quoteCurrency?.decimals, 4)
        : 0

      addTransaction(
        { hash },
        {
          type: 'add-liquidity-v3',
          summary: `Add ${baseAmount} ${baseCurrency?.symbol} and ${quoteAmount} ${quoteCurrency?.symbol}`,
        },
      )
      router.push('/liquidity/pools')
    },
    [router, addTransaction, baseCurrency, quoteCurrency, parsedAmounts],
  )

  const onAdd = useCallback(async () => {
    logGTMClickAddLiquidityConfirmEvent()
    if (!baseCurrency || !quoteCurrency || !price || !feeAmount) {
      setTxnErrorMessage(t('Missing required information'))
      return
    }
    try {
      setAttemptingTxn(true)
      const token0 = isSorted ? baseCurrency.wrapped : quoteCurrency.wrapped
      const token1 = isSorted ? quoteCurrency.wrapped : baseCurrency.wrapped
      const { buildData: createBuildData } = await createClmm({
        mintA: token0 as SPLToken,
        mintB: token1 as SPLToken,
        tradeFeeRate: feeAmount,
        initialPrice: parseFloat(price.toSignificant(18)),
        position:
          typeof tickLower === 'number' && typeof tickUpper === 'number'
            ? {
                tickLower,
                tickUpper,
                amountA: parsedAmounts[isSorted ? Field.CURRENCY_A : Field.CURRENCY_B] as any,
                amountB: parsedAmounts[isSorted ? Field.CURRENCY_B : Field.CURRENCY_A] as any,
              }
            : undefined,
      })

      const res = await addLiquidity({
        createBuildData,
        independentField,
        dependentField,
        parsedAmounts,
        ticks,
        poolInfo: createBuildData?.extInfo.mockPoolInfo,
        onTxUpdate: (data) => {
          addedCallback(data[0]?.txId)
        },
      })
      setTimeout(() => {
        const hash = 'txId' in res ? res.txId : 'txIds' in res ? res.txIds[0] : ''
        addedCallback(hash)
      }, 10000)
    } catch (e: any) {
      setAttemptingTxn(false)
      setTxnErrorMessage(e?.message || String(e))
      onPresentErrorModal()
      onDismissPreviewModal()
    }
  }, [
    onDismissPreviewModal,
    onPresentErrorModal,
    addedCallback,
    addLiquidity,
    dependentField,
    independentField,
    ticks,
    isSorted,
    baseCurrency,
    quoteCurrency,
    price,
    feeAmount,
    t,
    createClmm,
    parsedAmounts,
    tickLower,
    tickUpper,
  ])

  // Button Submit, with handle expert mode
  const handleButtonSubmit = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    expertMode ? onAdd() : onOpenPreviewModal()
    logGTMClickAddLiquidityEvent()
  }, [expertMode, onAdd, onOpenPreviewModal])

  // Effects
  useEffect(() => {
    setShowCapitalEfficiencyWarning(false)
  }, [baseCurrency, quoteCurrency, feeAmount])

  // Reset ranges when fee tier changes
  useEffect(() => {
    if (feeAmount) {
      setActiveQuickAction(undefined)
      onBothRangeInput({
        leftTypedValue: undefined,
        rightTypedValue: undefined,
      })
    }
    // NOTE: ignore exhaustive-deps to avoid infinite re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeAmount])

  // Manage quick action state
  useEffect(() => {
    if (!isQuickButtonUsed.current && activeQuickAction) {
      setActiveQuickAction(undefined)
      setQuickAction(null)
      setCustomZoomLevel(undefined)
    } else if (isQuickButtonUsed.current) {
      isQuickButtonUsed.current = false
    }
  }, [isQuickButtonUsed, activeQuickAction, leftRangeTypedValue, rightRangeTypedValue])

  const buttons = (
    <SolanaSubmitButton
      addIsUnsupported={addIsUnsupported}
      addIsWarning={addIsWarning}
      account={account ?? undefined}
      isWrongNetwork={Boolean(isWrongNetwork)}
      isValid={isValid}
      parsedAmounts={parsedAmounts}
      onClick={handleButtonSubmit}
      attemptingTxn={attemptingTxn}
      errorMessage={errorMessage}
      buttonText={t('Add')}
      depositADisabled={depositADisabled}
      depositBDisabled={depositBDisabled}
    />
  )

  const rangeSelector = (
    <AutoColumn gap="8px">
      <PreTitle>{t('Set Price Range')}</PreTitle>

      {!showCapitalEfficiencyWarning && (
        <V3RangeSelector
          priceLower={priceLower}
          priceUpper={priceUpper}
          getDecrementLower={getDecrementLower}
          getIncrementLower={getIncrementLower}
          getDecrementUpper={getDecrementUpper}
          getIncrementUpper={getIncrementUpper}
          onLeftRangeInput={onLeftRangeInput}
          onRightRangeInput={onRightRangeInput}
          currencyA={baseCurrency}
          currencyB={quoteCurrency}
          feeAmount={feeAmount ?? undefined}
          ticksAtLimit={ticksAtLimit}
          tickSpaceLimits={tickSpaceLimits}
          quickAction={activeQuickAction ?? null}
          handleQuickAction={handleQuickAction}
        />
      )}

      {showCapitalEfficiencyWarning && (
        <Message variant="warning">
          <Box>
            <Text fontSize="16px">{t('Efficiency Comparison')}</Text>
            <Text color="textSubtle">{t('Full range positions may earn less fees than concentrated positions.')}</Text>
            <Button
              mt="16px"
              onClick={() => {
                setShowCapitalEfficiencyWarning(false)
                getSetFullRange()
                setActiveQuickAction(100)
              }}
              scale="md"
              variant="danger"
            >
              {t('I understand')}
            </Button>
          </Box>
        </Message>
      )}

      {outOfRange ? (
        <Message variant="warning">
          <RowBetween>
            <Text ml="12px" fontSize="12px">
              {t('Your position will not earn fees or be used in trades until the market price moves into your range.')}
            </Text>
          </RowBetween>
        </Message>
      ) : null}

      {invalidRange ? (
        <Message variant="warning">
          <MessageText>{t('Invalid range selected. The min price must be lower than the max price.')}</MessageText>
        </Message>
      ) : null}
    </AutoColumn>
  )

  const previewModal = useMemo(() => {
    return (
      <PreviewModal
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        onConfirm={onAdd}
        isOpen={isPreviewModalOpen}
        onDismiss={onDismissPreviewModal}
        feeTier={feeAmount ? `${(feeAmount / 10_000).toFixed(2)}%` : undefined}
        attemptingTxn={attemptingTxn}
        details={{
          priceRange: (
            <>
              <FlexGap gap="4px" alignItems="center">
                <AutoColumn>
                  <div>
                    {rangeLeftValue} - {rangeRightValue}
                  </div>
                  <div>
                    {t('%assetA% = 1 %assetB%', {
                      assetA: quoteCurrency?.symbol,
                      assetB: baseCurrency?.symbol,
                    })}
                  </div>
                </AutoColumn>

                <IconButton variant="text" scale="sm" onClick={switchCurrencies}>
                  <SwapHorizIcon color="textSubtle" />
                </IconButton>
              </FlexGap>
            </>
          ),
          startPrice: (
            <>
              {invertPrice ? price?.invert().toSignificant(6) : price?.toSignificant(6)}{' '}
              {t('%assetA% = 1 %assetB%', {
                assetA: quoteCurrency?.symbol,
                assetB: baseCurrency?.symbol,
              })}
            </>
          ),
        }}
      />
    )
  }, [
    attemptingTxn,
    invertPrice,
    rangeLeftValue,
    rangeRightValue,
    switchCurrencies,
    currencies,
    parsedAmounts,
    onAdd,
    isPreviewModalOpen,
    onDismissPreviewModal,
    feeAmount,
    price,
    baseCurrency,
    quoteCurrency,
    t,
  ])

  return {
    // State
    formState,
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
    onBothRangePriceInput,
    onLeftRangePriceInput,
    onRightRangePriceInput,
    onFieldAInput,
    onFieldBInput,
    onStartPriceInput,
    switchCurrencies,
  }
}
