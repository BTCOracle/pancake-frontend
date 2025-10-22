import { getIdFromCurrencyPrice, MAX_BIN_STEP, MIN_BIN_STEP } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { AtomBox, Box, BoxProps, FlexGap, PreTitle, QuestionHelper, SwapCSS, Text } from '@pancakeswap/uikit'
import { NumericalInput } from '@pancakeswap/widgets-internal'
import { tryParsePrice } from 'hooks/v3/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveIdQueryState, useBinStepQueryState, useStartingPriceQueryState } from 'state/infinity/create'
import { useInverted } from 'state/infinity/shared'
import { isSolana } from '@pancakeswap/chains'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { useCurrencies } from '../hooks/useCurrencies'

type FieldBinStepProps = BoxProps

export const FieldBinStep: React.FC<FieldBinStepProps> = ({ ...boxProps }) => {
  const { t } = useTranslation()
  const [binStep, setBinStep] = useBinStepQueryState()
  const [activeId, setActiveId] = useActiveIdQueryState()
  const { currency0, currency1 } = useCurrencies()
  const c0 = currency0 && !isSolana(currency0.chainId) ? (currency0 as unknown as Currency) : undefined
  const c1 = currency1 && !isSolana(currency1.chainId) ? (currency1 as unknown as Currency) : undefined
  const [startPrice] = useStartingPriceQueryState()
  const [inverted] = useInverted()

  const isBinStepValid = useMemo(() => {
    if (binStep === null) return true

    if (!binStep) return false

    return binStep >= Number(MIN_BIN_STEP) && binStep <= Number(MAX_BIN_STEP)
  }, [binStep])

  const handleInputChange = useCallback(
    (value: string) => {
      setBinStep(value === '' ? null : Number(value))
      if (startPrice && value !== '' && activeId !== null && currency0 && currency1) {
        const price = inverted ? tryParsePrice(c1, c0, startPrice) : tryParsePrice(c0, c1, startPrice)
        if (!price) return
        const newActiveId = getIdFromCurrencyPrice(inverted ? price.invert() : price, Number(value))
        setActiveId(newActiveId)
      }
    },
    [activeId, currency0, currency1, inverted, setActiveId, setBinStep, startPrice, c0, c1],
  )

  const [hasInitialized, setHasInitialized] = useState(false)
  useEffect(() => {
    if (!hasInitialized && binStep === null) {
      setBinStep(10)
      setHasInitialized(true)
    }
  }, [binStep, hasInitialized, setBinStep])

  return (
    <Box {...boxProps}>
      <FlexGap gap="4px">
        <PreTitle mb="8px">{t('Bin Step')}</PreTitle>
        <QuestionHelper
          placement="auto"
          mb="8px"
          color="secondary"
          text={t(
            'A bin represents 0.01% price change. BinSpacing of 3 implies 1.0001^3 price change between two consecutive bins',
          )}
        />
      </FlexGap>
      <AtomBox className={SwapCSS.inputContainerVariants({ error: !isBinStepValid })}>
        <AtomBox display="flex" flexDirection="row" flexWrap="nowrap" color="text" px="16px" py="8px">
          <NumericalInput
            fontSize="20px"
            align="left"
            value={binStep ?? ''}
            onUserInput={handleInputChange}
            min={MIN_BIN_STEP.toString()}
            max={MAX_BIN_STEP.toString()}
            pattern="^[0-9]*$"
            error={!isBinStepValid}
            placeholder={t('Numerical Value')}
          />
        </AtomBox>
      </AtomBox>
      {!isBinStepValid && (
        <>
          <Text mt="8px" color="failure" small>
            {t('Bin Step must be between %min% and %max%', {
              min: MIN_BIN_STEP.toString(),
              max: MAX_BIN_STEP.toString(),
            })}
          </Text>
        </>
      )}
    </Box>
  )
}
