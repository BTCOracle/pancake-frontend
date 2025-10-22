import { getCurrencyPriceFromId } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { AtomBox, AutoColumn, Grid, Text } from '@pancakeswap/uikit'
import { LightCard, NumericalInput } from '@pancakeswap/widgets-internal'
import { RangeSelectorV2 } from 'components/Liquidity/RangeSelectorV2'
import { useBinNum } from 'hooks/infinity/useBinNum'
import { useBinPriceRangeCallback } from 'hooks/infinity/useBinPriceRangeCallback'
import debounce from 'lodash/debounce'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useBinRangeQueryState, useInverted } from 'state/infinity/shared'
import styled from 'styled-components'
import { maxUint24 } from 'viem'
import { useStartPriceAsFraction } from 'views/CreateLiquidityPool/hooks/useStartPriceAsFraction'
import { BinRangeSlider } from '../BinRangeSlider'

type BinRangeSelectorProps = {
  currency0: Currency | undefined
  currency1: Currency | undefined
  binStep: number | null
  activeBinId?: number | null
  minBinId?: number | null
  maxBinId?: number | null
}

export const BinRangeSelector: React.FC<BinRangeSelectorProps> = ({
  currency0,
  currency1,
  binStep,
  activeBinId,
  minBinId,
  maxBinId,
}) => {
  const [inverted] = useInverted()
  const [{ lowerBinId, upperBinId }, setBinRange] = useBinRangeQueryState()
  const startPriceAsFraction = useStartPriceAsFraction()

  const [range, setRange] = useState<{ min: number; max: number } | undefined>(
    lowerBinId && upperBinId ? { min: lowerBinId, max: upperBinId } : undefined,
  )
  const debouncedSetRange = debounce(
    (r?: { min: number; max: number }) => setBinRange({ lowerBinId: r?.min, upperBinId: r?.max }),
    100,
  )

  const handleBinRangeChange = useCallback(
    (newValue: number | number[]) => {
      const [min, max] = Array.isArray(newValue) ? newValue : [newValue, newValue]
      setRange({ min, max })
      debouncedSetRange({ min, max })
    },
    [debouncedSetRange],
  )
  const syncRange = useCallback((key: 'lowerBinId' | 'upperBinId', value: number | null) => {
    if (key === 'lowerBinId') {
      setRange((r) => ({ min: value ?? r?.min ?? 0, max: r?.max ?? 0 }))
    } else {
      setRange((r) => ({ min: r?.min ?? 0, max: value ?? r?.max ?? 0 }))
    }
  }, [])

  const { onLowerIncrement, onLowerDecrement, onUpperIncrement, onUpperDecrement, onLowerUserInput, onUpperUserInput } =
    useBinPriceRangeCallback({
      currency0,
      currency1,
      binStep,
      minBinId,
      maxBinId,
      callback: syncRange,
    })

  const [minPrice, maxPrice] = useMemo(() => {
    if (!currency0 || !currency1 || binStep === null) return [undefined, undefined]

    let lowerPrice: Price<Currency, Currency> | undefined
    let upperPrice: Price<Currency, Currency> | undefined

    if (lowerBinId) {
      lowerPrice = getCurrencyPriceFromId(lowerBinId, binStep, currency0, currency1)
    }

    if (upperBinId) {
      upperPrice = getCurrencyPriceFromId(upperBinId, binStep, currency0, currency1)
    }

    return inverted ? [upperPrice?.invert(), lowerPrice?.invert()] : [lowerPrice, upperPrice]
  }, [currency0, currency1, binStep, lowerBinId, upperBinId, inverted])

  const rangeError = useMemo(() => {
    const error = {
      minError: false,
      maxError: false,
    }

    if (lowerBinId === null || upperBinId === null) {
      return error
    }

    if ((minBinId && lowerBinId < minBinId) || (maxBinId && lowerBinId > maxBinId)) {
      error.minError = true
    }

    if ((maxBinId && upperBinId > maxBinId) || (minBinId && upperBinId < minBinId)) {
      error.maxError = true
    }

    if (inverted) {
      ;[error.minError, error.maxError] = [error.maxError, error.minError]
    }

    return error
  }, [inverted, lowerBinId, maxBinId, minBinId, upperBinId])

  const setDefaultBinRange = useCallback(() => {
    if (activeBinId) {
      let lower = activeBinId - 25 < 0 ? 1 : activeBinId - 25
      if (minBinId && lower < minBinId) {
        lower = minBinId
      }
      let upper = activeBinId + 25 > Number(maxUint24) ? Number(maxUint24) - 1 : activeBinId + 25
      if (maxBinId && upper > maxBinId) {
        upper = maxBinId
      }
      setBinRange({ lowerBinId: lower, upperBinId: upper })
      setRange({ min: lower, max: upper })
    }
  }, [activeBinId, minBinId, maxBinId, setBinRange])

  const [prevActiveBinId, setPrevActiveBinId] = useState<number | null>(activeBinId ?? null)
  useEffect(() => {
    if (activeBinId && activeBinId !== prevActiveBinId) {
      setDefaultBinRange()
      setPrevActiveBinId(activeBinId)
    }
  }, [activeBinId, prevActiveBinId, setDefaultBinRange])

  const [
    onMinPriceDecrement,
    onMinPriceIncrement,
    onMaxPriceDecrement,
    onMaxPriceIncrement,
    onMinPriceUserInput,
    onMaxPriceUserInput,
  ] = useMemo(() => {
    return inverted
      ? [onUpperIncrement, onUpperDecrement, onLowerIncrement, onLowerDecrement, onUpperUserInput, onLowerUserInput]
      : [onLowerDecrement, onLowerIncrement, onUpperDecrement, onUpperIncrement, onLowerUserInput, onUpperUserInput]
  }, [
    inverted,
    onLowerDecrement,
    onLowerIncrement,
    onUpperDecrement,
    onUpperIncrement,
    onLowerUserInput,
    onUpperUserInput,
  ])

  const { minPriceDecrementDisabled, minPriceIncrementDisabled, maxPriceDecrementDisabled, maxPriceIncrementDisabled } =
    useMemo(() => {
      if (!activeBinId || !lowerBinId || !upperBinId) {
        return {
          minPriceDecrementDisabled: true,
          minPriceIncrementDisabled: true,
          maxPriceDecrementDisabled: true,
          maxPriceIncrementDisabled: true,
        }
      }
      if (
        typeof maxBinId === 'undefined' ||
        typeof minBinId === 'undefined' ||
        maxBinId === null ||
        minBinId === null
      ) {
        return {
          minPriceDecrementDisabled: false,
          minPriceIncrementDisabled: false,
          maxPriceDecrementDisabled: false,
          maxPriceIncrementDisabled: false,
        }
      }
      const lowerIncreaseDisabled = lowerBinId + 1 > maxBinId
      const lowerDecreaseDisabled = lowerBinId - 1 < minBinId
      const upperIncreaseDisabled = upperBinId + 1 > maxBinId
      const upperDecreaseDisabled = upperBinId - 1 < minBinId

      return {
        minPriceDecrementDisabled: inverted ? upperIncreaseDisabled : lowerDecreaseDisabled,
        minPriceIncrementDisabled: inverted ? upperDecreaseDisabled : lowerIncreaseDisabled,
        maxPriceDecrementDisabled: inverted ? lowerIncreaseDisabled : upperDecreaseDisabled,
        maxPriceIncrementDisabled: inverted ? lowerDecreaseDisabled : upperIncreaseDisabled,
      }
    }, [activeBinId, inverted, lowerBinId, maxBinId, minBinId, upperBinId])

  return (
    <>
      {/* <span>
        binStep: {binStep} activeBinId: {activeBinId} inverted: {inverted ? 'true' : 'false'}
      </span> */}
      {activeBinId && maxBinId && minBinId && binStep && currency0 && currency1 ? (
        <AtomBox px="12px">
          <BinRangeSlider
            activePrice={startPriceAsFraction}
            defaultValue={[activeBinId - 25, activeBinId + 25]}
            min={minBinId}
            max={maxBinId}
            value={range ? [range.min, range.max] : undefined}
            step={1}
            allowCross={false}
            onChange={handleBinRangeChange}
          />
        </AtomBox>
      ) : null}

      <Grid gridGap="8px" gridTemplateColumns={['1fr', null, null, '7.4fr 2.6fr']}>
        <RangeSelectorV2
          minError={rangeError.minError}
          maxError={rangeError.maxError}
          baseCurrency={inverted ? currency1 : currency0}
          quoteCurrency={inverted ? currency0 : currency1}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceDecrement={onMinPriceDecrement}
          onMinPriceIncrement={onMinPriceIncrement}
          onMaxPriceDecrement={onMaxPriceDecrement}
          onMaxPriceIncrement={onMaxPriceIncrement}
          onMinPriceUserInput={onMinPriceUserInput}
          onMaxPriceUserInput={onMaxPriceUserInput}
          minPriceIncrementDisabled={minPriceIncrementDisabled}
          minPriceDecrementDisabled={minPriceDecrementDisabled}
          maxPriceIncrementDisabled={maxPriceIncrementDisabled}
          maxPriceDecrementDisabled={maxPriceDecrementDisabled}
        />
        <BinRangeNumBins />
      </Grid>
      {/* <Grid gridGap="16px" gridTemplateColumns="1fr 1fr 1fr">
        {[
          <div>
            <span>lowerBinId: {lowerBinId}</span>
            <br />
            <span>minBinId: {minBinId}</span>
          </div>,
          <div>
            <span>upperBinId: {upperBinId}</span>
            <br />
            <span>maxBinId: {maxBinId}</span>
          </div>,
        ].sort(() => (inverted ? -1 : 1))}
        <div>
          <span>binNum: {binNum}</span>
        </div>
      </Grid> */}
    </>
  )
}

const StyledLightCard = styled(LightCard)`
  padding: 12px;
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
`

const NumBinsInput = styled(NumericalInput)`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  border-radius: 16px;
  font-weight: 600;
  width: 100%;
  padding: 8px 16px;
`

export const BinRangeNumBins = ({
  disabled,
}: {
  disabled?: boolean
  minBinId?: number | null
  maxBinId?: number | null
}) => {
  const { t } = useTranslation()
  const { binNum, setBinNum } = useBinNum()
  const [{ lowerBinId, upperBinId }] = useBinRangeQueryState()

  const updateBinNums = useCallback(
    (value: string) => {
      if (value === '') {
        setBinNum(null)
        return
      }

      if (lowerBinId !== null || upperBinId !== null) {
        setBinNum(parseInt(value))
      }
    },
    [lowerBinId, upperBinId, setBinNum],
  )

  useEffect(() => {
    if (lowerBinId !== null && upperBinId !== null && binNum !== upperBinId - lowerBinId + 1) {
      const newNums = upperBinId - lowerBinId + 1
      updateBinNums(Number.isNaN(newNums) || !Number.isFinite(newNums) ? '' : newNums.toString())
    }
  }, [binNum, updateBinNums, lowerBinId, upperBinId])

  return (
    <StyledLightCard>
      <AutoColumn gap="12px" width="100%" textAlign="center">
        <Text color="secondary" textTransform="uppercase" fontSize="12px" bold>
          {t('num bins')}
        </Text>
        <NumBinsInput
          value={binNum ?? ''}
          onUserInput={updateBinNums}
          fontSize="20px"
          align="center"
          disabled={disabled}
        />
      </AutoColumn>
    </StyledLightCard>
  )
}
