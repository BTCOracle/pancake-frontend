import { useTranslation } from '@pancakeswap/localization'
import { Pair, Token, UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/sdk'
import {
  AtomBoxProps,
  Box,
  Button,
  ChevronDownIcon,
  domAnimation,
  Flex,
  LazyAnimatePresence,
  Loading,
  Skeleton,
  Text,
  useMatchBreakpoints,
  useModal,
} from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import { CurrencyLogo, DoubleCurrencyLogo, SwapUIV2 } from '@pancakeswap/widgets-internal'
import { RiskInputPanelDisplay } from 'components/AccessRisk/SwapRevampRiskDisplay'
import { FiatLogo } from 'components/Logo/CurrencyLogo'
import { CommonBasesType } from 'components/SearchModal/types'
import { useUnifiedUSDPriceAmount } from 'hooks/useStablecoinPrice'
import { useUnifiedCurrencyBalance } from 'hooks/useUnifiedCurrencyBalance'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { getTokenSymbolAlias } from 'utils/getTokenAlias'
import { StablePair } from 'views/AddLiquidity/AddStableLiquidity/hooks/useStableLPDerivedMintInfo'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { isSolana } from '@pancakeswap/chains'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import { FONT_SIZE, LOGO_SIZE, useFontSize } from './state'

export const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  padding: 24px 8px 22px;
  margin-top: 2px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.invertedContrast};
  }

  &:disabled {
    cursor: default;
    background: transparent;
  }
`
const SymbolText = styled(Text)`
  font-size: ${FONT_SIZE.LARGE}px;
  line-height: 1.1;
`

const formatDollarAmount = (amount: number) => {
  if (amount > 0 && amount < 0.01) {
    return '<0.01'
  }
  return formatNumber(amount)
}

const useSizeAdaption = (value: string, currencySymbol?: string, otherCurrencySymbol?: string) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const tokenImageRef = useRef<HTMLImageElement>(null)
  const symbolRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Linked font sizes are for Symbol and Logo only and not Input
  const { symbolFontSize, logoFontSize, setFontSizesBySymbol } = useFontSize(
    currencySymbol ?? '',
    otherCurrencySymbol ?? '',
  )

  const { isMobile, isXs, isSm } = useMatchBreakpoints()

  const shortedSymbol = useMemo(() => {
    const CUTOFF_FONT_SIZE = isMobile ? { left: 3, right: 3 } : { left: 5, right: 4 }

    if (currencySymbol && currencySymbol.length > 8) {
      return `${currencySymbol.slice(0, CUTOFF_FONT_SIZE.left)}...${currencySymbol.slice(
        currencySymbol.length - CUTOFF_FONT_SIZE.right,
        currencySymbol.length,
      )}`
    }
    return currencySymbol
  }, [currencySymbol, isMobile])

  useEffect(() => {
    if (!inputRef.current || !symbolRef.current || !wrapperRef.current || !tokenImageRef.current) return

    const inputElement = inputRef.current

    const wrapperWidth = wrapperRef.current.offsetWidth

    const fontWidth = 8 // consider for calculation an approx width of a character in large font size

    const valueIsPercentWidthOfWrapper = (value.length * fontWidth * 100) / wrapperWidth

    // Breakpoints of valueIsPercentWidthOfWrapper. Calibrated for ~4 character symbols
    const BREAKPOINT = isXs
      ? {
          ONE: 25,
          TWO: 30,
          THREE: 37,
          FOUR: 45,
        }
      : isSm
      ? {
          ONE: 35,
          TWO: 40,
          THREE: 44,
          FOUR: 50,
        }
      : {
          ONE: 40,
          TWO: 45,
          THREE: 50,
          FOUR: 57,
        }

    // Since the breakpoints are calibrated for 4 character symbols, we need to adjust for longer symbols
    const symbolExcessLength = shortedSymbol && shortedSymbol.length > 4 ? shortedSymbol?.length - 2 : 0

    if (valueIsPercentWidthOfWrapper >= BREAKPOINT.FOUR - symbolExcessLength) {
      inputElement.style.fontSize = `${FONT_SIZE.SMALL}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.SMALL, LOGO_SIZE.SMALL)
    } else if (valueIsPercentWidthOfWrapper >= BREAKPOINT.THREE - symbolExcessLength) {
      inputElement.style.fontSize = `${FONT_SIZE.MEDIUM}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.SMALL, LOGO_SIZE.MEDIUM)
    } else if (valueIsPercentWidthOfWrapper >= BREAKPOINT.TWO - symbolExcessLength) {
      inputElement.style.fontSize = `${FONT_SIZE.LARGE}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.MEDIUM, LOGO_SIZE.LARGE)
    } else if (valueIsPercentWidthOfWrapper >= BREAKPOINT.ONE - symbolExcessLength) {
      inputElement.style.fontSize = `${FONT_SIZE.X_LARGE}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.MEDIUM, LOGO_SIZE.X_LARGE)
    } else {
      inputElement.style.fontSize = `${FONT_SIZE.MAX}px`
      setFontSizesBySymbol(currencySymbol ?? '', FONT_SIZE.LARGE, LOGO_SIZE.MAX)
    }
  }, [value, currencySymbol, setFontSizesBySymbol, otherCurrencySymbol, isXs, isSm, shortedSymbol])

  useEffect(() => {
    const symbolElement = symbolRef.current
    if (!symbolElement) return

    symbolElement.style.fontSize = `${symbolFontSize}px`
  }, [symbolFontSize, currencySymbol, otherCurrencySymbol])

  useEffect(() => {
    const logoElement = tokenImageRef.current
    if (!logoElement) return

    logoElement.style.width = `${logoFontSize}px`
    logoElement.style.height = `${logoFontSize}px`
  }, [logoFontSize, currencySymbol, otherCurrencySymbol])

  return { shortedSymbol, inputRef, symbolRef, wrapperRef, tokenImageRef }
}

interface CurrencyInputPanelProps {
  defaultValue: string | undefined
  customChainId?: number
  onUserInput: (value: string) => void
  onInputBlur?: () => void
  onPercentInput?: (percent: number) => void
  onMax?: () => void
  showQuickInputButton?: boolean
  showMaxButton: boolean
  maxAmount?: UnifiedCurrencyAmount<UnifiedCurrency>
  lpPercent?: string
  label?: string
  onCurrencySelect?: (currency: UnifiedCurrency) => void
  currency?: UnifiedCurrency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | StablePair | null
  otherCurrency?: UnifiedCurrency | null
  id: string
  showCommonBases?: boolean
  commonBasesType?: CommonBasesType
  showSearchInput?: boolean
  beforeButton?: React.ReactNode
  isDependent?: boolean
  disabled?: boolean
  error?: boolean | string
  showUSDPrice?: boolean
  topOptions?: {
    show: boolean
    walletDisplay: boolean
  }
  tokensToShow?: Token[]
  currencyLoading?: boolean
  inputLoading?: boolean
  title?: React.ReactNode
  hideBalanceComp?: boolean
  isUserInsufficientBalance?: boolean
  modalTitle?: React.ReactNode
  showSearchHeader?: boolean
  wrapperProps?: AtomBoxProps
  supportCrossChain?: boolean
  showNative?: boolean
  maxDecimals?: number
}
const CurrencyInputPanelSimplify = memo(function CurrencyInputPanel({
  defaultValue,
  onUserInput,
  onInputBlur,
  onPercentInput,
  onMax,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  supportCrossChain = true,
  beforeButton,
  pair = null, // used for double token logo
  otherCurrency,
  id,
  showCommonBases,
  commonBasesType,
  showSearchInput,
  disabled,
  error,
  showUSDPrice,
  tokensToShow,
  topOptions = {
    show: true,
    walletDisplay: true,
  },
  currencyLoading,
  inputLoading,
  title,
  isUserInsufficientBalance,
  modalTitle,
  showSearchHeader,
  wrapperProps,
  customChainId,
  showNative,
  maxDecimals,
}: CurrencyInputPanelProps) {
  const { account: evmAccount, solanaAccount, unifiedAccount, chainId } = useAccountActiveChain()
  const account = useMemo(() => {
    if (!customChainId) return unifiedAccount
    return isSolana(customChainId) ? solanaAccount : evmAccount
  }, [customChainId, evmAccount, solanaAccount, unifiedAccount])
  const [value, setValue] = useState<string | undefined>(defaultValue)

  const selectedCurrencyBalance = useUnifiedCurrencyBalance(currency ?? undefined)

  const { t } = useTranslation()

  const mode = id
  const token = pair ? pair.liquidityToken : currency?.isToken && currency instanceof Token ? currency : null
  const [isInputFocus, setIsInputFocus] = useState(false)
  const inputBlurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const amountInDollar = useUnifiedUSDPriceAmount(
    showUSDPrice ? currency ?? undefined : undefined,
    value !== undefined && Number.isFinite(+value) ? +value : undefined,
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      supportCrossChain={supportCrossChain}
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      otherSelectedCurrency={otherCurrency}
      showCommonBases={showCommonBases}
      commonBasesType={commonBasesType}
      showSearchInput={showSearchInput}
      tokensToShow={tokensToShow}
      mode={mode}
      modalTitle={modalTitle}
      showSearchHeader={showSearchHeader}
      showNative={showNative}
    />,
  )

  const { shortedSymbol, inputRef, wrapperRef, tokenImageRef, symbolRef } = useSizeAdaption(
    value ?? '',
    getTokenSymbolAlias(currency?.wrapped?.address, currency?.chainId, currency?.symbol),
    getTokenSymbolAlias(otherCurrency?.wrapped?.address, otherCurrency?.chainId, otherCurrency?.symbol),
  )

  useEffect(() => {
    if (isInputFocus) {
      return
    }
    setValue(defaultValue)
  }, [defaultValue, isInputFocus])

  useEffect(() => {
    if (isInputFocus) {
      onUserInput(value ?? '')
    }
  }, [value, defaultValue, isInputFocus, onUserInput])

  useEffect(() => {
    return () => {
      if (inputBlurTimeoutRef.current) {
        clearTimeout(inputBlurTimeoutRef.current)
      }
    }
  }, [])

  const handlePercentInput = useCallback(
    (percent: number) => {
      if (onPercentInput) {
        setIsInputFocus(false)
        onPercentInput(percent)
      }
    },
    [onPercentInput],
  )

  const handleUserInput = useCallback((val: string) => {
    setValue(val)
  }, [])
  const handleUserInputBlur = useCallback(() => {
    onInputBlur?.()

    if (inputBlurTimeoutRef.current) {
      clearTimeout(inputBlurTimeoutRef.current)
    }
    inputBlurTimeoutRef.current = setTimeout(() => {
      setIsInputFocus(false)
      inputBlurTimeoutRef.current = null
    }, 300)
  }, [onInputBlur])

  const handleUserInputFocus = useCallback(() => {
    if (inputBlurTimeoutRef.current) {
      clearTimeout(inputBlurTimeoutRef.current)
      inputBlurTimeoutRef.current = null
    }
    setIsInputFocus(true)
  }, [])

  const onCurrencySelectClick = useCallback(() => {
    if (!disableCurrencySelect) {
      onPresentCurrencyModal()
    }
  }, [onPresentCurrencyModal, disableCurrencySelect])

  const balance = useMemo(
    () =>
      !hideBalance &&
      !!currency &&
      selectedCurrencyBalance &&
      !isUndefinedOrNull(selectedCurrencyBalance?.currency?.decimals)
        ? formatAmount(selectedCurrencyBalance, selectedCurrencyBalance?.currency?.decimals)
        : undefined,
    [selectedCurrencyBalance, currency, hideBalance],
  )

  return (
    <SwapUIV2.CurrencyInputPanelSimplify
      id={id}
      disabled={disabled}
      error={error as boolean}
      value={value}
      onInputBlur={handleUserInputBlur}
      onInputFocus={handleUserInputFocus}
      onUserInput={handleUserInput}
      loading={inputLoading}
      inputRef={inputRef}
      wrapperRef={wrapperRef}
      wrapperProps={wrapperProps}
      maxDecimals={maxDecimals}
      top={
        topOptions.show ? (
          <Flex justifyContent="space-between" alignItems="center" width="100%" position="relative">
            {title}
            {topOptions.walletDisplay && (
              <LazyAnimatePresence mode="wait" features={domAnimation}>
                {account ? (
                  !isInputFocus || !onMax ? (
                    <SwapUIV2.WalletAssetDisplay
                      isUserInsufficientBalance={isUserInsufficientBalance}
                      balance={balance}
                      onMax={onMax}
                    />
                  ) : (
                    <SwapUIV2.AssetSettingButtonList onPercentInput={handlePercentInput} />
                  )
                ) : null}
              </LazyAnimatePresence>
            )}
          </Flex>
        ) : null
      }
      inputLeft={
        <>
          <Flex alignItems="center">
            {beforeButton}
            <CurrencySelectButton
              className="open-currency-select-button"
              data-dd-action-name="Select currency"
              selected={!!currency}
              onClick={onCurrencySelectClick}
              disabled={disableCurrencySelect}
            >
              <Flex alignItems="center" justifyContent="space-between">
                {pair ? (
                  <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
                ) : currency ? (
                  id === 'onramp-input' ? (
                    <FiatLogo currency={currency} size={`${LOGO_SIZE.MAX}px`} style={{ marginRight: '8px' }} />
                  ) : (
                    <CurrencyLogo
                      showChainLogo
                      imageRef={tokenImageRef}
                      currency={currency}
                      size={`${LOGO_SIZE.MAX}px`}
                      containerStyle={{ marginRight: '8px' }}
                    />
                  )
                ) : currencyLoading ? (
                  <Skeleton width="40px" height="40px" variant="circle" />
                ) : (
                  <CurrencyLogo
                    imageRef={tokenImageRef}
                    currency={{ chainId }}
                    size={`${LOGO_SIZE.MAX}px`}
                    containerStyle={{ marginRight: '8px' }}
                    showChainLogo
                  />
                )}
                {currencyLoading ? null : pair ? (
                  <Text id="pair" bold fontSize="24px">
                    {getTokenSymbolAlias(pair?.token0.wrapped?.address, pair?.token0.chainId, pair?.token0.symbol)}:
                    {getTokenSymbolAlias(pair?.token1.wrapped?.address, pair?.token1.chainId, pair?.token1.symbol)}
                  </Text>
                ) : (
                  <Flex alignItems="start" flexDirection="column">
                    <Flex flexDirection="column" alignItems="flex-start">
                      <Flex alignItems="center" justifyContent="space-between">
                        <SymbolText id="pair" bold ref={symbolRef}>
                          {(currency && currency.symbol && shortedSymbol) || t('Select Token')}
                        </SymbolText>
                        {!currencyLoading && !disableCurrencySelect && <ChevronDownIcon />}
                      </Flex>

                      {currency && currency.symbol && (
                        <Text
                          style={{
                            fontSize: `${Math.max(
                              Number(symbolRef.current?.style.fontSize.replace('px', '')) - 7,
                              12,
                            )}px`,
                          }}
                          color="textSubtle"
                        >
                          {getFullChainNameById(currency.chainId)}
                        </Text>
                      )}
                    </Flex>
                    <RiskInputPanelDisplay token={token ?? undefined} />
                  </Flex>
                )}
              </Flex>
            </CurrencySelectButton>
          </Flex>
        </>
      }
      bottom={
        inputLoading || (showUSDPrice && Number.isFinite(amountInDollar)) ? (
          <Box position="absolute" bottom="12px" right="0px">
            <Flex justifyContent="flex-end" mr="1rem">
              <Flex maxWidth={['120px', '160px', '200px', '240px']}>
                {inputLoading ? (
                  <Loading width="14px" height="14px" />
                ) : showUSDPrice && Number.isFinite(amountInDollar) ? (
                  <>
                    <Text fontSize="14px" color="textSubtle" ellipsis>
                      {`~${amountInDollar && formatDollarAmount(amountInDollar)}`}
                    </Text>
                    <Text ml="4px" fontSize="14px" color="textSubtle">
                      USD
                    </Text>
                  </>
                ) : null}
              </Flex>
            </Flex>
          </Box>
        ) : null
      }
    />
  )
})

export default CurrencyInputPanelSimplify
