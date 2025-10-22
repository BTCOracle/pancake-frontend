import { Protocol } from '@pancakeswap/farms'
import { getPoolId } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Fraction } from '@pancakeswap/swap-sdk-core'
import {
  AutoRow,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  Container,
  Flex,
  Link,
  RowBetween,
  Spinner,
  Text,
  Toggle,
  useMatchBreakpoints,
  useModal,
} from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { isPoolTickInRange } from '@pancakeswap/v3-sdk'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'
import { LightGreyCard } from 'components/Card'
import { CurrencyLogo } from 'components/Logo'
import { MerklSection } from 'components/Merkl/MerklSection'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { useInfinityClammPositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { useFeesEarnedUSD } from 'hooks/infinity/useFeesEarned'
import { useHookByPoolId } from 'hooks/infinity/useHooksList'
import { useInfinityClPositionFromTokenId } from 'hooks/infinity/useInfinityPositions'
import { usePositionIsFarming } from 'hooks/infinity/useIsFarming'
import useIsTickAtLimit from 'hooks/infinity/useIsTickAtLimit'
import { usePositionAmount } from 'hooks/infinity/usePositionAmount'
import { useCurrencyByChainId } from 'hooks/Tokens'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useInfinityCLPositionManagerContract } from 'hooks/useContract'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { NextSeo } from 'next-seo'
import { useCallback, useMemo, useState } from 'react'
import { useExtraInfinityPositionInfo, usePoolInfo } from 'state/farmsV4/hooks'
import { type InfinityCLPoolInfo } from 'state/farmsV4/state/type'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useIsTransactionPending } from 'state/transactions/hooks'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { formatPositionAmount, InfinityCLPoolPositionAprButton } from 'views/universalFarms/components'
import useInfinityCollectFeeAction from 'views/universalFarms/hooks/useInfinityCollectFeeAction'

import { isAddressEqual } from 'utils'
import { zeroAddress } from 'viem'
import { PositionHeader } from './components/PositionHeader'
import { PositionPriceSection } from './components/PositionPrice'

export const InfinityCLPosition = () => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const { account, chainId } = useAccountActiveChain()
  const { tokenId: tokenIdFromUrl } = useInfinityClammPositionIdRouteParams()

  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [collectMigrationHash, setCollectMigrationHash] = useState<string | null>(null)
  const [receiveWNATIVE, setReceiveWNATIVE] = useState(false)

  const { isLoading: loading, position: positionDetails } = useInfinityClPositionFromTokenId(tokenIdFromUrl, chainId)
  const {
    token0: token0Address,
    token1: token1Address,
    fee: feeAmount,
    liquidity,
    tickLower,
    tickUpper,
    tokenId,
    poolKey,
  } = positionDetails || {}

  const currency0 = useCurrencyByChainId(token0Address, chainId)
  const currency1 = useCurrencyByChainId(token1Address, chainId)

  const {
    priceLower,
    priceUpper,
    base: currencyBase,
    quote: currencyQuote,
    pool,
    invert: setManuallyInverted,
    inverted: manuallyInverted,
  } = useExtraInfinityPositionInfo(positionDetails)

  const poolId = poolKey ? getPoolId(poolKey) : undefined
  const poolInfo = usePoolInfo<InfinityCLPoolInfo>({ poolAddress: poolId, chainId })
  const tickAtLimit = useIsTickAtLimit(tickLower, tickUpper, pool?.tickSpacing)

  // fees
  const { feeAmount0, feeAmount1, totalFiatValue } = useFeesEarnedUSD({
    currency0,
    currency1,
    tokenId,
    poolId,
    tickLower,
    tickUpper,
  })

  const { onCollect, attemptingTx: collectAttemptingTxn } = useInfinityCollectFeeAction({
    chainId,
    onDone: setCollectMigrationHash,
  })
  const isCollectPending = useIsTransactionPending(collectMigrationHash ?? undefined)

  const { amount0: positionAmount0, amount1: positionAmount1 } = usePositionAmount({
    token0: currency0,
    token1: currency1,
    tickCurrent: pool?.tickCurrent,
    tickLower,
    tickUpper,
    sqrtRatioX96: pool?.sqrtRatioX96,
    liquidity,
  })

  const enablePrice0 = useMemo(
    () => Boolean(positionAmount0?.greaterThan(0) || feeAmount0?.greaterThan(0)),
    [positionAmount0, feeAmount0],
  )
  const enablePrice1 = useMemo(
    () => Boolean(positionAmount1?.greaterThan(0) || feeAmount1?.greaterThan(0)),
    [positionAmount1, feeAmount1],
  )

  // usdc prices always in terms of tokens
  const price0 = useStablecoinPrice(currency0, { enabled: enablePrice0 })
  const price1 = useStablecoinPrice(currency1, { enabled: enablePrice1 })

  const fiatValueOfLiquidity: CurrencyAmount<Currency> | null = useMemo(() => {
    if ((!price0 && !price1) || (!positionAmount0 && !positionAmount1)) return null

    let amount0: CurrencyAmount<Currency> | undefined
    let amount1: CurrencyAmount<Currency> | undefined

    // Safely quote amount0 with proper error handling
    if (price0 && positionAmount0) {
      try {
        // Check if currencies are compatible before quoting
        if (positionAmount0.currency.equals(price0.baseCurrency)) {
          amount0 = price0.quote(positionAmount0) as CurrencyAmount<Currency>
        } else {
          console.warn('Currency mismatch for price0.quote(positionAmount0)', {
            positionAmount0Currency: positionAmount0.currency.symbol,
            price0BaseCurrency: price0.baseCurrency.symbol,
          })
        }
      } catch (error) {
        console.error('Error quoting amount0:', error)
      }
    }

    // Safely quote amount1 with proper error handling
    if (price1 && positionAmount1) {
      try {
        // Check if currencies are compatible before quoting
        if (positionAmount1.currency.equals(price1.baseCurrency)) {
          amount1 = price1.quote(positionAmount1) as CurrencyAmount<Currency>
        } else {
          console.warn('Currency mismatch for price1.quote(positionAmount1)', {
            positionAmount1Currency: positionAmount1.currency.symbol,
            price1BaseCurrency: price1.baseCurrency.symbol,
          })
        }
      } catch (error) {
        console.error('Error quoting amount1:', error)
      }
    }

    if (amount0 && amount1) return amount0.add(amount1)
    if (amount0) return amount0
    if (amount1) return amount1

    return null
  }, [price0, price1, positionAmount0, positionAmount1])

  const handleDismissConfirmation = useCallback(() => {
    setErrorMessage(undefined)
  }, [])

  const wrapAddress = useMemo(() => {
    if (!currency0 || !currency1 || !receiveWNATIVE) return zeroAddress
    if (currency0.isNative) return currency0.wrapped.address
    if (currency1.isNative) return currency1.wrapped.address

    return zeroAddress
  }, [currency0, currency1, receiveWNATIVE])

  const collect = useCallback(() => {
    if (!chainId || !account || !tokenId || !poolKey) {
      return
    }
    onCollect({
      tokenId,
      poolKey,
      wrapAddress,
    })
  }, [chainId, account, tokenId, poolKey, onCollect, wrapAddress])
  const contractOfCLPM = useInfinityCLPositionManagerContract(chainId)
  const owner = useSingleCallResult({
    contract: tokenId ? contractOfCLPM : undefined,
    functionName: 'ownerOf',
    args: useMemo(() => [Number(tokenId)], [tokenId]),
  }).result
  const isOwnNFT = isAddressEqual(owner, account) || isAddressEqual(positionDetails?.operator, account)

  const feeValueUpper = manuallyInverted ? feeAmount0 : feeAmount1
  const feeValueLower = manuallyInverted ? feeAmount1 : feeAmount0

  const positionValueUpper = manuallyInverted ? positionAmount0 : positionAmount1
  const positionValueLower = manuallyInverted ? positionAmount1 : positionAmount0
  const priceValueUpper = manuallyInverted ? price0 : price1
  const priceValueLower = manuallyInverted ? price1 : price0

  // status
  const inRange = isPoolTickInRange((pool as any) ?? undefined, tickLower, tickUpper)
  const removed = liquidity === 0n
  const isFarming = usePositionIsFarming({ chainId, poolId })

  const nativeCurrency = useNativeCurrency()
  const nativeWrappedSymbol = nativeCurrency.wrapped.symbol

  const getCurrencySymbolByReceived = useCallback(
    (currency?: Currency) => (receiveWNATIVE ? currency?.wrapped.symbol : currency?.symbol),
    [receiveWNATIVE],
  )

  const showCollectAsWNative = Boolean(
    isOwnNFT &&
      currency0 &&
      currency1 &&
      ((currency0.isNative && feeAmount0?.greaterThan(0)) || (currency1.isNative && feeAmount1?.greaterThan(0))) &&
      !collectMigrationHash,
  )

  const hookData = useHookByPoolId(chainId, poolId)

  const modalHeader = useCallback(
    () => (
      <>
        <LightGreyCard mb="16px">
          <AutoRow justifyContent="space-between" mb="8px">
            <Flex>
              <CurrencyLogo currency={feeValueUpper?.currency} size="24px" />
              <Text color="textSubtle" ml="4px">
                {getCurrencySymbolByReceived(feeValueUpper?.currency)}
              </Text>
            </Flex>
            <Text>{feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4, locale) : '-'}</Text>
          </AutoRow>
          <AutoRow justifyContent="space-between">
            <Flex>
              <CurrencyLogo currency={feeValueLower?.currency} size="24px" />
              <Text color="textSubtle" ml="4px">
                {getCurrencySymbolByReceived(feeValueLower?.currency)}
              </Text>
            </Flex>
            <Text>{feeValueLower ? formatCurrencyAmount(feeValueLower, 4, locale) : '-'}</Text>
          </AutoRow>
        </LightGreyCard>
        <Text mb="16px" px="16px">
          {t('Collecting fees will withdraw currently available fees for you')}
        </Text>
      </>
    ),
    [feeValueLower, feeValueUpper, getCurrencySymbolByReceived, locale, t],
  )

  const modalContent = useCallback(
    () => (
      <ConfirmationModalContent
        topContent={modalHeader}
        bottomContent={() => (
          <Button width="100%" onClick={collect}>
            {t('Collect')}
          </Button>
        )}
      />
    ),
    [collect, modalHeader, t],
  )

  const [onClaimFee] = useModal(
    <TransactionConfirmationModal
      title={t('Claim fees')}
      attemptingTxn={collectAttemptingTxn}
      customOnDismiss={handleDismissConfirmation}
      hash={collectMigrationHash ?? ''}
      errorMessage={errorMessage}
      content={modalContent}
      pendingText={t('Collecting fees')}
    />,
    true,
    true,
    'TransactionConfirmationModalCollectFees',
  )

  const isLoading = loading || !poolKey

  const { isMobile } = useMatchBreakpoints()

  const LoadingEle = useMemo(
    () => (
      <Flex width="100%" justifyContent="center" alignItems="center" minHeight="200px" mb="32px">
        <Spinner />
      </Flex>
    ),
    [],
  )

  return (
    <>
      {!isLoading && (
        <NextSeo title={`${currencyQuote?.symbol}-${currencyBase?.symbol} Infinity LP #${tokenIdFromUrl}`} />
      )}
      <Container width={['100%', '100%', '100%', '80rem']}>
        {isLoading ? (
          LoadingEle
        ) : (
          <>
            {currency0 && currency1 ? (
              <Box my={['18px', '26px', '26px', '42px']}>
                <Breadcrumbs>
                  <Link href="/liquidity/pools">{t('Farm')}</Link>
                  <Text>{`${currency0?.symbol} / ${currency1?.symbol}`}</Text>
                </Breadcrumbs>
              </Box>
            ) : null}
            <Card style={{ maxWidth: '800px' }} mx="auto">
              {chainId ? (
                <PositionHeader
                  isOwner={isOwnNFT}
                  isOutOfRange={!inRange}
                  isFarming={isFarming && !removed}
                  protocol={Protocol.InfinityCLAMM}
                  currency0={currency0}
                  currency1={currency1}
                  chainId={chainId}
                  feeTier={feeAmount}
                  dynamic={poolInfo?.isDynamicFee}
                  isRemoved={removed}
                  hookData={hookData}
                  poolId={poolId}
                  tokenId={tokenId ? Number(tokenId) : undefined}
                />
              ) : null}
              <CardBody>
                <AutoRow>
                  <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    mb="8px"
                    style={{ gap: '16px' }}
                    flexWrap={['wrap', 'wrap', 'nowrap']}
                  >
                    <Box width="100%" mb={['8px', '8px', 0]} position="relative">
                      <Flex position="absolute" right={0}>
                        {poolInfo && positionDetails && (
                          <InfinityCLPoolPositionAprButton pool={poolInfo} userPosition={positionDetails} />
                        )}
                      </Flex>
                      <Text fontSize="12px" color="secondary" bold textTransform="uppercase">
                        {t('Liquidity')}
                      </Text>

                      <Text fontSize="24px" fontWeight={600} mb="8px">
                        $
                        {fiatValueOfLiquidity?.greaterThan(new Fraction(1, 100))
                          ? fiatValueOfLiquidity.toFixed(2, { groupSeparator: ',' })
                          : '-'}
                      </Text>
                      <LightGreyCard
                        mr="4px"
                        style={{
                          padding: '12px 16px',
                        }}
                      >
                        <AutoRow justifyContent="space-between" mb="8px">
                          <Flex>
                            <CurrencyLogo currency={currencyQuote} />
                            <Text small color="textSubtle" id="remove-liquidity-tokenb-symbol" ml="4px">
                              {positionValueUpper?.currency.symbol}
                            </Text>
                          </Flex>
                          <Flex justifyContent="center">
                            <Text small mr="4px">
                              {formatNumber(formatPositionAmount(positionValueUpper))}
                            </Text>
                          </Flex>
                          <RowBetween justifyContent="flex-end">
                            <Text fontSize="14px" color="textSubtle" mr="4px">
                              {positionValueUpper && priceValueUpper
                                ? (() => {
                                    try {
                                      if (positionValueUpper.currency.equals(priceValueUpper.baseCurrency)) {
                                        return `~$${priceValueUpper
                                          .quote(positionValueUpper)
                                          .toFixed(2, { groupSeparator: ',' })}`
                                      }
                                    } catch (error) {
                                      console.error('Error quoting positionValueUpper:', error)
                                    }
                                    return ''
                                  })()
                                : ''}
                            </Text>
                          </RowBetween>
                        </AutoRow>
                        <AutoRow justifyContent="space-between">
                          <Flex>
                            <CurrencyLogo currency={currencyBase} />
                            <Text small color="textSubtle" id="remove-liquidity-tokenb-symbol" ml="4px">
                              {positionValueLower?.currency.symbol}
                            </Text>
                          </Flex>
                          <Flex justifyContent="center">
                            <Text small mr="4px">
                              {formatNumber(formatPositionAmount(positionValueLower))}
                            </Text>
                          </Flex>
                          <RowBetween justifyContent="flex-end">
                            <Text fontSize="14px" color="textSubtle" mr="4px">
                              {positionValueLower && priceValueLower
                                ? (() => {
                                    try {
                                      if (positionValueLower.currency.equals(priceValueLower.baseCurrency)) {
                                        return `~$${priceValueLower
                                          .quote(positionValueLower)
                                          .toFixed(2, { groupSeparator: ',' })}`
                                      }
                                    } catch (error) {
                                      console.error('Error quoting positionValueLower:', error)
                                    }
                                    return ''
                                  })()
                                : ''}
                            </Text>
                          </RowBetween>
                        </AutoRow>
                      </LightGreyCard>
                    </Box>
                    <Box width="100%">
                      <Text fontSize="12px" color="secondary" bold textTransform="uppercase">
                        {t('Unclaimed Fees')}
                      </Text>
                      <AutoRow justifyContent="space-between" mb="8px">
                        <Text fontSize="24px" fontWeight={600}>
                          $
                          {totalFiatValue?.greaterThan(new Fraction(1, 100))
                            ? totalFiatValue.toFixed(2, { groupSeparator: ',' })
                            : '-'}
                        </Text>

                        <Button
                          scale="sm"
                          variant="secondary"
                          disabled={
                            !isOwnNFT ||
                            collectAttemptingTxn ||
                            isCollectPending ||
                            !(feeAmount0?.greaterThan(0) || feeAmount1?.greaterThan(0) || !!collectMigrationHash)
                          }
                          onClick={onClaimFee}
                        >
                          {!!collectMigrationHash && !isCollectPending
                            ? t('Collected')
                            : isCollectPending || collectAttemptingTxn
                            ? t('Collecting...')
                            : t('Collect')}
                        </Button>
                      </AutoRow>
                      <LightGreyCard
                        mr="4px"
                        style={{
                          padding: '12px 16px',
                        }}
                      >
                        <AutoRow justifyContent="space-between" mb="8px">
                          <Flex>
                            <CurrencyLogo currency={feeValueUpper?.currency} />
                            <Text small color="textSubtle" id="remove-liquidity-tokenb-symbol" ml="4px">
                              {getCurrencySymbolByReceived(feeValueUpper?.currency)}
                            </Text>
                          </Flex>
                          <Flex justifyContent="center">
                            <Text small>{feeValueUpper ? formatCurrencyAmount(feeValueUpper, 4, locale) : '-'}</Text>
                          </Flex>
                          <RowBetween justifyContent="flex-end">
                            <Text fontSize="14px" color="textSubtle" ml="4px">
                              {feeValueUpper && priceValueUpper
                                ? (() => {
                                    try {
                                      if (feeValueUpper.currency.equals(priceValueUpper.baseCurrency)) {
                                        return `~$${priceValueUpper
                                          .quote(feeValueUpper)
                                          .toFixed(2, { groupSeparator: ',' })}`
                                      }
                                    } catch (error) {
                                      console.error('Error quoting feeValueUpper:', error)
                                    }
                                    return ''
                                  })()
                                : ''}
                            </Text>
                          </RowBetween>
                        </AutoRow>
                        <AutoRow justifyContent="space-between">
                          <Flex>
                            <CurrencyLogo currency={feeValueLower?.currency} />
                            <Text small color="textSubtle" id="remove-liquidity-tokenb-symbol" ml="4px">
                              {getCurrencySymbolByReceived(feeValueLower?.currency)}
                            </Text>
                          </Flex>
                          <Flex justifyContent="center">
                            <Text small>{feeValueLower ? formatCurrencyAmount(feeValueLower, 4, locale) : '-'}</Text>
                          </Flex>
                          <RowBetween justifyContent="flex-end">
                            <Text fontSize="14px" color="textSubtle" ml="4px">
                              {feeValueLower && priceValueLower
                                ? (() => {
                                    try {
                                      if (feeValueLower.currency.equals(priceValueLower.baseCurrency)) {
                                        return `~$${priceValueLower
                                          .quote(feeValueLower)
                                          .toFixed(2, { groupSeparator: ',' })}`
                                      }
                                    } catch (error) {
                                      console.error('Error quoting feeValueLower:', error)
                                    }
                                    return ''
                                  })()
                                : ''}
                            </Text>
                          </RowBetween>
                        </AutoRow>
                      </LightGreyCard>
                    </Box>
                  </Flex>
                </AutoRow>
                {showCollectAsWNative && (
                  <Flex mb="8px">
                    <Flex ml="auto" alignItems="center">
                      <Text mr="8px">
                        {t('Collect as')} {nativeWrappedSymbol}
                      </Text>
                      <Toggle
                        id="receive-as-wnative"
                        scale="sm"
                        checked={receiveWNATIVE}
                        onChange={() => setReceiveWNATIVE((prevState) => !prevState)}
                      />
                    </Flex>
                  </Flex>
                )}
                <Flex flexWrap={['wrap', 'wrap', 'wrap', 'nowrap']}>
                  <Box width="100%">
                    <PositionPriceSection
                      setInverted={setManuallyInverted}
                      currencyQuote={currencyQuote}
                      currencyBase={currencyBase}
                      isMobile={isMobile}
                      priceLower={priceLower}
                      priceUpper={priceUpper}
                      pool={pool}
                      inverted={manuallyInverted}
                      tickAtLimit={tickAtLimit}
                    />
                  </Box>

                  <MerklSection
                    disabled={!isOwnNFT}
                    outRange={!inRange}
                    notEnoughLiquidity={Boolean(
                      fiatValueOfLiquidity
                        ? fiatValueOfLiquidity.lessThan(
                            // NOTE: if Liquidity is lessage 20$, can't participate in Merkl
                            new Fraction(
                              BigInt(20) * fiatValueOfLiquidity.decimalScale * fiatValueOfLiquidity.denominator,
                              fiatValueOfLiquidity?.denominator,
                            ),
                          )
                        : false,
                    )}
                    poolAddress={poolId}
                    poolProtocol={Protocol.InfinityCLAMM}
                  />
                </Flex>
                {/* {positionDetails && currency0 && currency1 && (
                  <PositionHistory
                    tokenId={positionDetails.tokenId.toString()}
                    currency0={currency0}
                    currency1={currency1}
                  />
                )} */}
              </CardBody>
            </Card>
          </>
        )}
      </Container>
    </>
  )
}
