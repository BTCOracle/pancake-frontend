import { Box, ErrorIcon, IconButton, Input, Message, SwapHorizIcon, Text } from '@pancakeswap/uikit'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import styled, { keyframes } from 'styled-components'
import { ChangeEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { Trans, useTranslation } from '@pancakeswap/localization'
import { BigNumber as BN } from 'bignumber.js'
import { escapeRegExp } from '@pancakeswap/utils/escapeRegExp'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { flipCurrenciesAtom } from '../state/currency/setCurrencyAtoms'
import { customMarketPriceAtom } from '../state/form/customMarketPriceAtom'
import { currentMarketPriceAtom } from '../state/form/currentMarketPriceAtom'
import { selectedPoolAtom } from '../state/pools/selectedPoolAtom'
import { getTickAdjustedPrice } from '../utils/ticks'
import { ticksAtom } from '../state/form/ticksAtom'
import { getSymbolDecimals } from '../constants/decimalConfig'

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

const InputContainer = styled(Box)`
  position: relative;
  width: 100%;
`

const StyledInput = styled(Input).attrs({ scale: 'lg' })`
  height: 100px;

  padding-top: 24px;
  padding-bottom: 16px;
  padding-left: 40%;

  border-radius: 24px;

  text-align: right;
  font-size: 24px;
  font-weight: 600;
`

const InputTopLeft = styled(Box)`
  position: absolute;
  top: 12px;
  left: 16px;
`

const InputTopRight = styled(Box)`
  position: absolute;
  top: 12px;
  right: 16px;
`

const InputBottomBar = styled(Box)`
  position: absolute;

  width: fit-content;

  bottom: 8px;
  right: 16px;

  text-align: right;
`

const InputLeftBox = styled(Box)`
  position: absolute;

  left: 16px;
  top: 48%;
`

const messageAnimation = keyframes`
  from { opacity: 0.2; transform: translateY(-3px); }
  to { opacity: 1; transform: translateY(0); }
`
const MessageContainer = styled(Box)`
  opacity: 0.2;
  transform: translateY(0);
  transform-origin: top;
  animation: ${messageAnimation} 0.2s ease-out forwards;
`

function truncateString(str: string, maxLength: number) {
  if (!str || typeof str !== 'string') return ''
  if (str.length < maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

export const MarketPriceInput = () => {
  const { t } = useTranslation()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const { data: pool } = useAtomValue(selectedPoolAtom)

  const currentMarketPrice_ = useAtomValue(currentMarketPriceAtom)
  const [customMarketPrice_, setCustomMarketPrice] = useAtom(customMarketPriceAtom)

  // Testing better way to display accurate price
  // Instead of displaying currentMarketPrice or customMarketPrice,
  // use sqrt price from the decided tick range
  const ticksData = useAtomValue(ticksAtom)
  const currentMarketPrice = ticksData
    ? ticksData.sqrtPrice.toFixed(getSymbolDecimals(outputCurrency?.symbol))
    : currentMarketPrice_
  const customMarketPrice = ticksData
    ? ticksData.sqrtPrice.toFixed(getSymbolDecimals(outputCurrency?.symbol))
    : customMarketPrice_

  const [localPrice, setLocalPrice] = useState(currentMarketPrice)
  const [isFocused, setIsFocused] = useState(false)

  const tokenPriceUSD = useStablecoinPrice(outputCurrency, { enabled: !!outputCurrency })
  const usdValue = useMemo(() => {
    return tokenPriceUSD && localPrice
      ? BN(localPrice || 0)
          .multipliedBy(BN(tokenPriceUSD.toFixed(18)))
          .toNumber()
      : 0
  }, [localPrice, tokenPriceUSD])

  const flipCurrencies = useSetAtom(flipCurrenciesAtom)

  // Sync market price to local price input
  useEffect(() => {
    // If user has not set custom market price, continue to sync values
    if (customMarketPrice === undefined && currentMarketPrice) {
      setLocalPrice(currentMarketPrice)
      return
    }
    if (customMarketPrice) setLocalPrice(customMarketPrice)
  }, [customMarketPrice, currentMarketPrice, setLocalPrice])

  const handleCustomMarketPriceInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!inputRegex.test(escapeRegExp(e.target.value))) return

      // Replace commas with periods, because we exclusively use period as the decimal separator
      const value = e.target.value.replace(/,/g, '.')

      if (value === currentMarketPrice) return

      setLocalPrice(value)
    },
    [currentMarketPrice, setLocalPrice],
  )

  // Adjust price based on tick and set it as new custom price
  const handleInputAdjust = useCallback(() => {
    if (!pool || !inputCurrency || !outputCurrency) return
    const {
      pool: { tickSpacing },
      zeroForOne,
    } = pool

    if (localPrice === currentMarketPrice) return
    if (!localPrice) {
      setCustomMarketPrice(undefined)
      return
    }

    const localPriceBN = BN(localPrice)
    if (localPriceBN.lte(0) || localPriceBN.isNaN() || !localPriceBN.isFinite()) return

    const { price } = getTickAdjustedPrice(localPrice, tickSpacing, inputCurrency, outputCurrency, zeroForOne)
    if (!price) return

    setCustomMarketPrice(price.toFixed(getSymbolDecimals(outputCurrency?.symbol)))
    setLocalPrice(price.toFixed(getSymbolDecimals(outputCurrency?.symbol)))
  }, [pool, inputCurrency, outputCurrency, localPrice, setLocalPrice, setCustomMarketPrice])

  if (!inputCurrency || !outputCurrency) return null

  return (
    <Suspense>
      <InputContainer>
        <InputTopLeft>
          <Text color="textSubtle" small>
            <Trans
              i18nTemplate="Sell when 1 <0>%inputSymbol%</0> is worth:"
              values={{
                inputSymbol: truncateString(inputCurrency.symbol, 15),
              }}
              components={[<Text as="span" color="textSubtle" small bold />]}
            />
          </Text>
        </InputTopLeft>
        <InputTopRight>
          <IconButton variant="text" scale="xs" onClick={flipCurrencies}>
            <SwapHorizIcon color="primary60" width="18px" />
          </IconButton>
        </InputTopRight>
        <InputLeftBox>
          <Text color="textSubtle" fontSize="20px" bold>
            {truncateString(outputCurrency.symbol, 15)}
          </Text>
        </InputLeftBox>
        <StyledInput
          type="text"
          inputMode="decimal"
          value={localPrice}
          onChange={handleCustomMarketPriceInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            handleInputAdjust()
          }}
          onKeyDown={(e) => {
            if (e.code === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          placeholder="0.00"
          pattern="^[0-9]*[.,]?[0-9]*$"
          minLength={1}
          maxLength={79}
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
        />
        {usdValue ? (
          <InputBottomBar>
            <Text color="textSubtle" small>
              ~{formatDollarAmount(usdValue, undefined, false).replace('$', '')} USD
            </Text>
          </InputBottomBar>
        ) : null}
      </InputContainer>
      {isFocused && (
        <MessageContainer>
          <Message variant="primary60" icon={<ErrorIcon width="24px" height="24px" color="v2Primary60" />}>
            <Text color="black" small>
              {t(
                'Limit price will be rounded to the nearest tick because orders are placed by adding liquidity to a CLAMM pool.',
              )}
            </Text>
          </Message>
        </MessageContainer>
      )}
    </Suspense>
  )
}
