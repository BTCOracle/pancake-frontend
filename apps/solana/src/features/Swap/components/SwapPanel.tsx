import { Box, Button, Tooltip as ChakraTip, CircularProgress, Collapse, Flex, HStack, Text, useDisclosure } from '@chakra-ui/react'
import { Dots, mediaQueries } from '@pancakeswap/uikit'
import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import { ApiV3Token, RAYMint, SOL_INFO, TokenInfo, TransferFeeDataBaseType } from '@pancakeswap/solana-core-sdk'
import { NATIVE_MINT } from '@solana/spl-token-0.4'
import { PublicKey } from '@solana/web3.js'
import Decimal from 'decimal.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { shallow } from 'zustand/shallow'
import ConnectedButton from '@/components/ConnectedButton'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenInput, { DEFAULT_SOL_RESERVER, InputActionRef } from '@/components/TokenInput'
import Tooltip from '@/components/Tooltip'
import useTokenInfo from '@/hooks/token/useTokenInfo'
import { useEvent } from '@/hooks/useEvent'
import CircleInfo from '@/icons/misc/CircleInfo'
import QuestionCircleIcon from '@/icons/misc/QuestionCircleIcon'
import WarningIcon from '@/icons/misc/WarningIcon'
import { useAppStore, useTokenAccountStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { debounce } from '@/utils/functionMethods'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import ToPublicKey, { isValidPublicKey } from '@/utils/publicKey'
import { setUrlQuery, useRouteQuery } from '@/utils/routeTools'
import { logGTMSolErrorLogEvent, logGTMSwapClickEvent, logGTMSwapTxSuccEvent } from '@/utils/report/curstomGTMEventTracking'
import { getMintPriority, getMintSymbol, isSolWSol, mintToUrl, urlToMint } from '@/utils/token'
import { ApiSuccessResponse, QuoteResponseData, SwapType } from '../type'
import useSwap from '../useSwap'
import { useSwapStore } from '../useSwapStore'
import { getSwapPairCache, isWSol, setSwapPairCache } from '../util'
import { FlipButton } from './FlipButton'
import HighRiskAlert from './HighRiskAlert'
import { SwapInfoBoard } from './SwapInfoBoard'

const Wrapper = styled(Box)`
  width: 100%;

  ${mediaQueries.md} {
    min-width: 328px;
    max-width: 480px;
  }
`

const ButtonAndDetailsPanel = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border-radius: 24px;
  background-color: ${colors.backgroundAlt};
  border: 1px solid ${colors.cardBorder01};
`

export function SwapPanel({
  onInputMintChange,
  onOutputMintChange,
  onDirectionNeedReverse
}: {
  onInputMintChange?: (mint: string) => void
  onOutputMintChange?: (mint: string) => void
  onDirectionNeedReverse?(): void
}) {
  const query = useRouteQuery<{ inputMint: string; outputMint: string }>()
  const [urlInputMint, urlOutputMint] = [urlToMint(query.inputMint), urlToMint(query.outputMint)]
  const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
  const [defaultInput, defaultOutput] = [urlInputMint || cacheInput, urlOutputMint || cacheOutput]

  const { t } = useTranslation()
  const { swap: swapDisabled } = useAppStore().featureDisabled
  const wallet = useAppStore((s) => s.wallet)
  const swapTokenAct = useSwapStore((s) => s.swapTokenAct)
  const unWrapSolAct = useSwapStore((s) => s.unWrapSolAct)
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [getTokenBalanceUiAmount, fetchTokenAccountAct, refreshTokenAccTime] = useTokenAccountStore(
    (s) => [s.getTokenBalanceUiAmount, s.fetchTokenAccountAct, s.refreshTokenAccTime],
    shallow
  )
  const { isOpen: isSending, onOpen: onSending, onClose: offSending } = useDisclosure()
  const { isOpen: isUnWrapping, onOpen: onUnWrapping, onClose: offUnWrapping } = useDisclosure()
  const { isOpen: isHightRiskOpen, onOpen: onHightRiskOpen, onClose: offHightRiskOpen } = useDisclosure()
  const sendingResult = useRef<ApiSuccessResponse<QuoteResponseData> | undefined>()
  const wsolBalance = getTokenBalanceUiAmount({ mint: NATIVE_MINT.toBase58(), decimals: SOL_INFO.decimals })

  const [inputMint, setInputMint] = useState<string>(PublicKey.default.toBase58())
  const [swapType, setSwapType] = useState<SwapType>('exactIn')

  const [outputMint, setOutputMint] = useState<string>(RAYMint.toBase58())
  const [tokenInput, tokenOutput] = [tokenMap.get(inputMint), tokenMap.get(outputMint)]
  const [cacheLoaded, setCacheLoaded] = useState(false)
  const isTokenLoaded = tokenMap.size > 0
  const { tokenInfo: unknownTokenA } = useTokenInfo({
    mint: isTokenLoaded && !tokenInput && inputMint ? inputMint : undefined
  })
  const tokenAActionRef = useRef<InputActionRef>({ refreshPrice: () => {} })
  const { tokenInfo: unknownTokenB } = useTokenInfo({
    mint: isTokenLoaded && !tokenOutput && outputMint ? outputMint : undefined
  })
  const tokenBActionRef = useRef<InputActionRef>({ refreshPrice: () => {} })

  const { tokenInfo: inputInfo } = useTokenInfo(
    tokenInput?.type === 'jupiter'
      ? {
          mint: tokenInput.address,
          programId: ToPublicKey(tokenInput.programId),
          skipTokenMap: true
        }
      : {}
  )

  const { tokenInfo: outputInfo } = useTokenInfo(
    tokenOutput?.type === 'jupiter'
      ? {
          mint: tokenOutput.address,
          programId: ToPublicKey(tokenOutput.programId),
          skipTokenMap: true
        }
      : {}
  )
  const [inputFeeConfig, outputFeeConfig] = [
    tokenInput?.extensions?.feeConfig || inputInfo?.extensions?.feeConfig,
    tokenOutput?.extensions?.feeConfig || outputInfo?.extensions?.feeConfig
  ]

  useEffect(() => {
    if (defaultInput) setInputMint(defaultInput)
    if (defaultOutput && defaultOutput !== defaultInput) setOutputMint(defaultOutput)
    setCacheLoaded(true)
  }, [defaultInput, defaultOutput])

  useEffect(() => {
    if (!cacheLoaded) return
    onInputMintChange?.(inputMint)
    onOutputMintChange?.(outputMint)
    const validInputMint = isValidPublicKey(inputMint) ? inputMint : ''
    const validOutputMint = isValidPublicKey(outputMint) ? outputMint : ''
    setUrlQuery({ inputMint: mintToUrl(validInputMint), outputMint: mintToUrl(validOutputMint) })
  }, [onOutputMintChange, onInputMintChange, inputMint, outputMint, cacheLoaded])

  const [amountIn, setAmountIn] = useState<string>('')
  const [needPriceUpdatedAlert, setNeedPriceUpdatedAlert] = useState(false)
  const [hasValidAmountOut, setHasValidAmountOut] = useState(false)

  const handleUnwrap = useEvent(() => {
    onUnWrapping()
    unWrapSolAct({
      t,
      amount: wsolBalance.rawAmount.toFixed(0),
      onSent: offUnWrapping,
      onClose: offUnWrapping,
      onError: offUnWrapping
    })
  })

  const isSwapExactIn = swapType === 'exactIn'
  const { response, data, isLoading, isValidating, error, mutate } = useSwap({
    inputMint,
    outputMint,
    amount: new Decimal(amountIn || 0)
      .mul(10 ** ((isSwapExactIn ? tokenInput?.decimals : tokenOutput?.decimals) || 0))
      .toFixed(0, Decimal.ROUND_FLOOR),
    swapType,
    refreshInterval: isSending || isHightRiskOpen ? 3 * 60 * 1000 : 1000 * 30
  })

  const onPriceUpdatedConfirm = useEvent(() => {
    setNeedPriceUpdatedAlert(false)
    sendingResult.current = response
  })

  const computeResult = needPriceUpdatedAlert ? sendingResult.current?.data : data?.data
  const isComputing = isLoading || isValidating
  const isHighRiskTx = (computeResult?.priceImpactPct || 0) > 5
  const isPriceImpactTooHigh = (computeResult?.priceImpactPct || 0) > 10

  const inputAmount =
    computeResult && tokenInput
      ? new Decimal(computeResult.inputAmount).div(10 ** tokenInput?.decimals).toFixed(tokenInput?.decimals)
      : computeResult?.inputAmount || ''
  const outputAmount =
    computeResult && tokenOutput
      ? new Decimal(computeResult.outputAmount).div(10 ** tokenOutput?.decimals).toFixed(tokenOutput?.decimals)
      : computeResult?.outputAmount || ''

  useEffect(() => {
    if (!cacheLoaded) return
    const [inputMint_, outputMint_] = [urlToMint(query.inputMint), urlToMint(query.outputMint)]
    if (inputMint_ && tokenMap.get(inputMint_)) {
      setInputMint(inputMint_)
      setSwapPairCache({
        inputMint: inputMint_
      })
    }
    if (outputMint_ && tokenMap.get(outputMint_)) {
      setOutputMint(outputMint_)
      setSwapPairCache({
        outputMint: outputMint_
      })
    }
  }, [tokenMap, cacheLoaded, query.inputMint, query.outputMint])

  useEffect(() => {
    if (isSending && response?.data?.outputAmount !== sendingResult.current?.data.outputAmount) {
      setNeedPriceUpdatedAlert(true)
    }
  }, [response?.data?.outputAmount, isSending])

  const debounceUpdate = useCallback(
    debounce(({ outputAmount: outputAmount_, isComputing: isComputing_ }) => {
      setHasValidAmountOut(Number(outputAmount_) !== 0 || isComputing_)
    }, 150),
    []
  )

  useEffect(() => {
    debounceUpdate({ outputAmount, isComputing })
  }, [debounceUpdate, outputAmount, isComputing])

  const handleInputChange = useCallback((val: string) => {
    setSwapType('exactIn')
    setAmountIn(val)
  }, [])

  const handleInput2Change = useCallback((val: string) => {
    setSwapType('exactOut')
    setAmountIn(val)
  }, [])

  const handleSelectToken = useCallback(
    (token: TokenInfo | ApiV3Token, side?: 'input' | 'output') => {
      if (side === 'input') {
        if (getMintPriority(token.address) > getMintPriority(outputMint)) {
          onDirectionNeedReverse?.()
        }
        setInputMint(token.address)
        setOutputMint((mint) => (token.address === mint ? '' : mint))
      }
      if (side === 'output') {
        if (getMintPriority(inputMint) > getMintPriority(token.address)) {
          onDirectionNeedReverse?.()
        }
        setOutputMint(token.address)
        setInputMint((mint) => {
          if (token.address === mint) {
            return ''
          }
          return mint
        })
      }
    },
    [inputMint, outputMint, onDirectionNeedReverse]
  )

  const handleChangeSide = useEvent(() => {
    setInputMint(outputMint)
    setOutputMint(inputMint)
    setSwapPairCache({
      inputMint: outputMint,
      outputMint: inputMint
    })
  })

  const balanceAmount = getTokenBalanceUiAmount({ mint: inputMint, decimals: tokenInput?.decimals }).amount
  const balanceNotEnough = balanceAmount.lt(inputAmount || 0) ? t('Insufficent balance') : undefined
  const isSolFeeNotEnough = inputAmount && isSolWSol(inputMint || '') && balanceAmount.sub(inputAmount || 0).lt(DEFAULT_SOL_RESERVER)

  const handleHighRiskConfirm = useEvent(() => {
    offHightRiskOpen()
    handleClickSwap()
  })

  const handleClickSwap = () => {
    if (!response) return
    logGTMSwapClickEvent()
    sendingResult.current = response
    onSending()
    swapTokenAct({
      t,
      swapResponse: response,
      wrapSol: tokenInput?.address === PublicKey.default.toString(),
      unwrapSol: tokenOutput?.address === PublicKey.default.toString(),
      onCloseToast: offSending,
      onConfirmed: ({ txId } = {}) => {
        logGTMSwapTxSuccEvent({
          fromAddress: wallet?.adapter.publicKey?.toString() ?? '',
          fromToken: tokenInput?.address ?? '',
          fromAmt: response.data.inputAmount,
          toToken: tokenOutput?.address ?? '',
          toAmt: response.data.outputAmount,
          txId: txId ?? ''
        })
        // setAmountIn('')
        // setNeedPriceUpdatedAlert(false)
        offSending()
      },
      onError: (e) => {
        logGTMSolErrorLogEvent({
          action: 'Swap Fail',
          e
        })
        offSending()
        mutate()
      }
    })
  }

  const getCtrSx = (type: SwapType) => {
    if (!new Decimal(amountIn || 0).isZero() && swapType === type) {
      return {
        border: `1px solid ${colors.semanticFocus}`,
        boxShadow: `0px 0px 12px 6px ${colors.semanticFocusShadow}`
      }
    }
    return { border: '1px solid transparent' }
  }

  const handleRefresh = useEvent(() => {
    if (isSending || isHightRiskOpen) return
    mutate()
    tokenAActionRef.current?.refreshPrice()
    tokenBActionRef.current?.refreshPrice()
    if (Date.now() - refreshTokenAccTime < 10 * 1000) return
    fetchTokenAccountAct({})
  })

  const outputFilterFn = useEvent((token: TokenInfo) => {
    if (isSolWSol(tokenInput?.address) && isSolWSol(token.address)) return false
    return true
  })
  const inputFilterFn = useEvent((token: TokenInfo) => {
    if (isSolWSol(tokenOutput?.address) && isSolWSol(token.address)) return false
    return true
  })

  const {
    swapError,
    loadingText,
    disabled,
    isLoading: isSwapLoading
  } = useMemo(() => {
    const emptyAmountIn = new Decimal(amountIn || 0).isZero()
    const swapError = emptyAmountIn ? t('Enter an amount') : error || balanceNotEnough
    const disabled = emptyAmountIn || !!swapError || needPriceUpdatedAlert || swapDisabled
    const isLoading = isComputing || isSending
    const loadingText = (
      <div>
        {isSending ? (
          <>
            {t('Transaction initiating')}
            <Dots />
          </>
        ) : isComputing ? (
          <>
            {t('Computing')}
            <Dots />
          </>
        ) : (
          ''
        )}
      </div>
    )
    return {
      swapError,
      loadingText,
      disabled,
      isLoading
    }
  }, [amountIn, balanceNotEnough, error, isComputing, isSending, needPriceUpdatedAlert, swapDisabled, t])

  const buttonText = useMemo(() => {
    if (swapDisabled) return t('Disabled')
    if (swapError) return swapError
    if (isHighRiskTx) return t('Swap Anyway')
    return t('Swap')
  }, [swapDisabled, isHighRiskTx, t, swapError])

  return (
    <Wrapper height="100%">
      <SwapUIV2.InputPanelWrapper id="swap-page">
        <Flex mb={[4, 5]} direction="column">
          {/* input */}
          <TokenInput
            name="swap"
            topLeftLabel={t('From')}
            ctrSx={getCtrSx('exactIn')}
            token={tokenInput}
            value={isSwapExactIn ? amountIn : inputAmount}
            readonly={swapDisabled || (!isSwapExactIn && isComputing)}
            disableClickBalance={swapDisabled}
            onChange={(v) => handleInputChange(v)}
            filterFn={inputFilterFn}
            onTokenChange={(token) => handleSelectToken(token, 'input')}
            defaultUnknownToken={unknownTokenA}
            actionRef={tokenAActionRef}
          />
          {/* <SwapIcon onClick={handleChangeSide} /> */}
          <FlipButton onClick={handleChangeSide} />
          {/* output */}
          <TokenInput
            name="swap"
            topLeftLabel={t('To')}
            ctrSx={getCtrSx('exactOut')}
            token={tokenOutput}
            value={isSwapExactIn ? outputAmount : amountIn}
            readonly={swapDisabled || (isSwapExactIn && isComputing)}
            onChange={handleInput2Change}
            filterFn={outputFilterFn}
            onTokenChange={(token) => handleSelectToken(token, 'output')}
            defaultUnknownToken={unknownTokenB}
            actionRef={tokenBActionRef}
          />
        </Flex>
      </SwapUIV2.InputPanelWrapper>
      <ButtonAndDetailsPanel>
        <ConnectedButton
          variant={isHighRiskTx ? 'danger' : 'primary'}
          disabled={disabled}
          isLoading={isSwapLoading}
          loadingText={loadingText}
          onClick={isHighRiskTx ? onHightRiskOpen : handleClickSwap}
        >
          <Text>{buttonText}</Text>
        </ConnectedButton>
        {isSolFeeNotEnough ? (
          <Flex
            rounded="xl"
            p="2"
            fontSize="sm"
            bg="rgba(255, 78, 163,0.1)"
            color={colors.semanticError}
            alignItems="start"
            justifyContent="center"
          >
            <WarningIcon style={{ marginTop: '2px', marginRight: '4px' }} stroke={colors.semanticError} />
            <Text>
              {t('You need at least %amount% %symbol% to pay for fees and deposits', {
                amount: formatToRawLocaleStr(DEFAULT_SOL_RESERVER),
                symbol: isWSol(inputMint) ? 'WSOL' : 'SOL'
              })}
            </Text>
          </Flex>
        ) : null}
        <Collapse in={hasValidAmountOut} animateOpacity>
          <Box>
            <SwapInfoBoard
              amountIn={amountIn}
              tokenInput={tokenInput}
              tokenOutput={tokenOutput}
              isComputing={isComputing && !isSending}
              computedSwapResult={computeResult as any}
              onRefresh={handleRefresh}
            />
          </Box>
        </Collapse>

        <Collapse in={needPriceUpdatedAlert}>
          <Box>
            <SwapPriceUpdatedAlert onConfirm={onPriceUpdatedConfirm} />
          </Box>
        </Collapse>

        {wsolBalance.isZero ? null : (
          <Flex
            rounded="md"
            mt="-2"
            mb="3"
            fontSize="xs"
            fontWeight={400}
            bg={colors.backgroundTransparent07}
            alignItems="center"
            px="4"
            py="2"
            gap="1"
            color={colors.textSecondary}
          >
            <CircleInfo />
            {t('You have %amount% WSOL that you can ', { amount: wsolBalance.text })}
            {isUnWrapping ? (
              <Progress />
            ) : (
              <Text cursor="pointer" color={colors.textLink} onClick={handleUnwrap}>
                {t('unwrap')}
              </Text>
            )}
          </Flex>
        )}
        {inputFeeConfig || outputFeeConfig ? (
          <Flex mt="-1" mb="4">
            {inputFeeConfig && tokenInput ? (
              <Tooltip
                contentBoxProps={{ sx: { width: 'fit-content' } }}
                label={<TransferFeeTip feeConfig={inputFeeConfig} token={tokenInput!} />}
              >
                <Box
                  fontSize="xs"
                  bg={colors.backgroundTransparent10}
                  borderColor={colors.primary}
                  color={colors.primary}
                  borderWidth="1px"
                  px="1"
                  borderRadius="4px"
                >
                  {getMintSymbol({ mint: tokenInput })} ({inputFeeConfig.newerTransferFee.transferFeeBasisPoints / 100}% {t('Tax')})
                </Box>
              </Tooltip>
            ) : null}

            {outputFeeConfig && tokenOutput ? (
              <Tooltip
                contentBoxProps={{ sx: { width: 'fit-content' } }}
                label={<TransferFeeTip feeConfig={outputFeeConfig} token={tokenOutput!} />}
              >
                <Box
                  fontSize="xs"
                  bg={colors.backgroundTransparent10}
                  borderColor={colors.primary}
                  color={colors.primary}
                  borderWidth="1px"
                  px="1"
                  borderRadius="4px"
                >
                  {getMintSymbol({ mint: tokenOutput })} ({outputFeeConfig.newerTransferFee.transferFeeBasisPoints / 100}% {t('Tax')})
                </Box>
              </Tooltip>
            ) : null}
          </Flex>
        ) : null}

        <HighRiskAlert
          isOpen={isHightRiskOpen}
          onClose={offHightRiskOpen}
          onConfirm={handleHighRiskConfirm}
          percent={computeResult?.priceImpactPct ?? 0}
        />
      </ButtonAndDetailsPanel>
    </Wrapper>
  )
}

function SwapPriceUpdatedAlert({ onConfirm }: { onConfirm: () => void }) {
  const { t } = useTranslation()
  return (
    <HStack bg={colors.backgroundDark} padding="8px 16px" rounded="xl" justify="space-between">
      <HStack color={colors.textSecondary}>
        <Text fontSize="sm">{t('Price updated')}</Text>
        <QuestionToolTip label={t('Price has changed since your swap amount was entered.')} />
      </HStack>
      <Button size={['sm', 'md']} onClick={onConfirm}>
        {t('Accept')}
      </Button>
    </HStack>
  )
}

function Progress() {
  return <CircularProgress isIndeterminate size="16px" />
}

function TransferFeeTip({ feeConfig, token }: { feeConfig: TransferFeeDataBaseType; token: TokenInfo }) {
  const { t } = useTranslation()
  return (
    <>
      <Text color={colors.text02} fontWeight="500" mb="1">
        {t('Token2022 Asset')}
      </Text>
      <Text color={colors.primary}>
        {t('This token uses the Token2022 Program, which provides a set of token extensions to be enabled by the token creator.')}
      </Text>
      <Text color={colors.semanticWarning} fontWeight="500">
        {t('Please trade with caution')}
      </Text>
      <Box
        mt="2"
        position="relative"
        bg={colors.backgroundTransparent07}
        borderWidth="1px"
        borderStyle="solid"
        borderColor={colors.backgroundTransparent12}
        rounded="md"
        px={4}
        pt={1.5}
        pb={2}
      >
        <Flex flexDir={['column', 'row']} justifyContent="space-between" gap={[0, 2]}>
          <Flex alignItems="center" gap="0.5">
            <Text whiteSpace="nowrap" wordBreak="keep-all">
              {t('Transfer Fee')}
            </Text>
            <ChakraTip label="A transfer fee derived from the amount of the token being transferred.">
              <QuestionCircleIcon />
            </ChakraTip>
          </Flex>
          <Text color={colors.text02}>{feeConfig.newerTransferFee.transferFeeBasisPoints / 100}%</Text>
        </Flex>
        <Flex flexDir={['column', 'row']} justifyContent="space-between" gap={[0, 2]}>
          <Flex alignItems="center" gap="0.5">
            <Text whiteSpace="nowrap" wordBreak="keep-all">
              {t('Max Transfer Fee')}
            </Text>
            <ChakraTip label="Maximum amount for the transfer fee, set by the authority mint.">
              <QuestionCircleIcon />
            </ChakraTip>
          </Flex>
          <Text color={colors.text02}>
            {formatCurrency(
              new Decimal(feeConfig.newerTransferFee.maximumFee)
                .div(10 ** token.decimals)
                .toDecimalPlaces(token.decimals)
                .toString(),
              { decimalPlaces: token.decimals }
            )}
            &nbsp;
            {token.symbol}
          </Text>
        </Flex>
      </Box>
    </>
  )
}
