import { PriceOrder } from '@pancakeswap/price-api-sdk'
import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { BIG_INT_ZERO } from 'config/constants/exchange'
import { useEffect, useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { logGTMQuoteQueryEvent } from 'utils/customGTMEventTracking'
import { CreateStateMachine, useStateMachine } from '../../../hooks/useStateMachine'

type QuoteState = 'idle' | 'started' | 'completed'
type QuoteEvent = 'START_QUOTE' | 'QUOTE_SUCCESS' | 'QUOTE_FAIL'

interface UseQuoteTrackingParams {
  typedValue: string
  tradeLoading?: boolean
  tradeError?: Error | null
  inputCurrency?: UnifiedCurrency | null
  outputCurrency?: UnifiedCurrency | null
  swapInputError?: string
  parsedAmounts: { [field in Field]?: any }
  disabled?: boolean
  isValid?: boolean
  order?: PriceOrder
}

export const useQuoteTrackingStateMachine = ({
  typedValue,
  tradeLoading = false,
  tradeError,
  inputCurrency,
  outputCurrency,
  swapInputError,
  parsedAmounts,
  disabled = false,
  isValid = false,
  order,
}: UseQuoteTrackingParams): void => {
  const isSwapButtonEnabled = isValid && !disabled

  // Create state machine configuration
  const stateMachineConfig: CreateStateMachine<QuoteState, QuoteEvent> = useMemo(
    () => ({
      initialState: 'idle',
      states: {
        idle: {
          on: {
            START_QUOTE: {
              target: 'started',
              guard: () => {
                if (!typedValue) return false
                const haveEnoughData = inputCurrency?.chainId && outputCurrency?.chainId
                return Boolean(tradeLoading && haveEnoughData && !parsedAmounts[Field.OUTPUT])
              },
              action: () => {
                logGTMQuoteQueryEvent('start', {
                  fromChain: inputCurrency?.chainId,
                  toChain: outputCurrency?.chainId,
                  fromToken: inputCurrency?.symbol,
                  toToken: outputCurrency?.symbol,
                  amount: typedValue,
                })
              },
            },
          },
        },
        started: {
          on: {
            QUOTE_SUCCESS: {
              target: 'completed',
              guard: () => {
                return Boolean(order?.trade?.outputAmount?.greaterThan(BIG_INT_ZERO) && isSwapButtonEnabled)
              },
              action: () => {
                logGTMQuoteQueryEvent('succ', {
                  fromChain: order?.trade?.inputAmount?.currency?.chainId,
                  toChain: order?.trade?.outputAmount?.currency?.chainId,
                  fromToken: order?.trade?.inputAmount?.currency?.symbol,
                  toToken: order?.trade?.outputAmount?.currency?.symbol,
                  amount: order?.trade?.inputAmount?.toExact(),
                  amountOut: order?.trade?.outputAmount?.toExact(),
                })
              },
            },
            QUOTE_FAIL: {
              target: 'completed',
              guard: () => {
                if (tradeLoading || !parsedAmounts[Field.INPUT]?.greaterThan(BIG_INT_ZERO) || isSwapButtonEnabled) {
                  return false
                }
                const errorMsg = tradeError?.message || swapInputError
                return Boolean(errorMsg)
              },
              action: () => {
                const errorMsg = tradeError?.message || swapInputError
                if (errorMsg) {
                  logGTMQuoteQueryEvent('fail', {
                    fromChain: inputCurrency?.chainId,
                    toChain: outputCurrency?.chainId,
                    fromToken: inputCurrency?.symbol,
                    toToken: outputCurrency?.symbol,
                    amount: typedValue,
                    errorMessage: errorMsg,
                  })
                }
              },
            },
          },
        },
        completed: {},
      },
    }),
    [
      inputCurrency?.chainId,
      outputCurrency?.chainId,
      inputCurrency?.symbol,
      outputCurrency?.symbol,
      typedValue,
      parsedAmounts[Field.INPUT]?.toExact() || '',
      parsedAmounts[Field.OUTPUT]?.toExact() || '',
      tradeLoading,
      tradeError?.message,
      swapInputError,
      isSwapButtonEnabled,
      order?.trade?.inputAmount?.toExact() || '',
      order?.trade?.outputAmount?.toExact() || '',
    ],
  )

  // Initialize state machine with auto-reset dependencies
  const stateMachine = useStateMachine(stateMachineConfig, [
    typedValue,
    inputCurrency?.chainId,
    outputCurrency?.chainId,
  ])

  // Trigger state transitions based on conditions
  useEffect(() => {
    if (stateMachine.is('idle')) {
      stateMachine.send('START_QUOTE')
    }
  }, [tradeLoading, inputCurrency, outputCurrency, typedValue, parsedAmounts, stateMachine])

  useEffect(() => {
    if (stateMachine.is('started')) {
      stateMachine.send('QUOTE_SUCCESS')
    }
  }, [order, isSwapButtonEnabled, stateMachine])

  useEffect(() => {
    if (stateMachine.is('started')) {
      stateMachine.send('QUOTE_FAIL')
    }
  }, [
    tradeError,
    inputCurrency,
    outputCurrency,
    swapInputError,
    typedValue,
    isSwapButtonEnabled,
    parsedAmounts,
    tradeLoading,
    stateMachine,
  ])
}
