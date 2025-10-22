import { BridgeOrder } from '@pancakeswap/price-api-sdk'
import { SkeletonV2, Text } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { memo, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useSolanaTokenPrices } from 'hooks/solana/useSolanaTokenPrice'
import { formatNumber } from '@pancakeswap/utils/formatNumber'

import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { isSolana } from '@pancakeswap/chains'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'

export const SolanaBridgeEVMToSolanaTradingFee = memo(
  ({ order, textColor }: { order: BridgeOrder; textColor?: string }) => {
    const inputCurrency = order.trade.inputAmount.currency

    const { data: price, isLoading } = useCurrencyUsdPrice(inputCurrency, { enabled: true })

    const convertedFeeAmount = useMemo(() => {
      if (!price || price === 0) return null
      return new BigNumber(order.bridgeFee.toExact()).dividedBy(price)
    }, [order.bridgeFee, price])

    const displayText = useMemo(() => {
      if (convertedFeeAmount !== null) {
        return `~${formatNumber(convertedFeeAmount, { maxDecimalDisplayDigits: 6 })} ${inputCurrency.symbol}`
      }
      return `${formatAmount(order.bridgeFee, 4)} ${order.bridgeFee.currency.symbol}`
    }, [convertedFeeAmount, order.bridgeFee, inputCurrency.symbol])

    return (
      <SkeletonV2 width="100px" height="16px" borderRadius="8px" minHeight="auto" isDataReady={!isLoading}>
        <Text color={textColor} fontSize="14px">
          {displayText}
        </Text>
      </SkeletonV2>
    )
  },
)

export const SolanaBridgeSolanaToEVMTradingFee = memo(
  ({ order, textColor }: { order: BridgeOrder; textColor?: string }) => {
    const inputCurrency = order.trade.inputAmount.currency

    // Get address for input currency only
    const inputCurrencyAddress = inputCurrency.wrapped.address

    // Get price for input currency only (bridgeFeeCurrency is always USDC = $1)
    const { data: priceMap, isLoading } = useSolanaTokenPrices({
      mints: [inputCurrencyAddress],
      enabled: true,
    })

    const convertedFeeAmount = useMemo(() => {
      if (!inputCurrencyAddress) return null

      const address = inputCurrencyAddress.toLowerCase()
      if (!priceMap || !priceMap[address] || priceMap[address] === 0) {
        return null
      }

      const inputCurrencyPrice = priceMap[address]

      // Convert bridge fee from USDC (stable coin = $1) to input currency
      // bridgeFeeUSD = bridgeFee * 1 (USDC price is always $1)
      // feeInInputCurrency = bridgeFeeUSD / inputCurrencyPrice
      const bridgeFeeUSD = new BigNumber(order.bridgeFee.toExact())
      const feeInInputCurrency = bridgeFeeUSD.dividedBy(inputCurrencyPrice)

      return feeInInputCurrency.toNumber()
    }, [order.bridgeFee, priceMap, inputCurrencyAddress])

    const displayText = useMemo(() => {
      if (convertedFeeAmount !== null) {
        return `~${formatNumber(convertedFeeAmount, { maxDecimalDisplayDigits: 6 })} ${inputCurrency.symbol}`
      }
      // Fallback to original display if conversion fails
      return `${formatAmount(order.bridgeFee, 4)} ${order.bridgeFee.currency.symbol}`
    }, [convertedFeeAmount, inputCurrency.symbol, order.bridgeFee])

    return (
      <SkeletonV2 width="100px" height="16px" borderRadius="8px" minHeight="auto" isDataReady={!isLoading}>
        <Text color={textColor} fontSize="14px">
          {displayText}
        </Text>
      </SkeletonV2>
    )
  },
)

export const SolanaBridgeTradingFee = memo(
  ({ order, textColor, showUSDFee }: { order: BridgeOrder; textColor?: string; showUSDFee?: boolean }) => {
    if (showUSDFee) {
      return (
        <Text color={textColor} fontSize="14px">
          {`${formatDollarAmount(new BigNumber(order.bridgeFee.toExact()).toNumber(), 3)}`}
        </Text>
      )
    }

    const feeText = isSolana(order.bridgeFee.currency.chainId) ? (
      <SolanaBridgeSolanaToEVMTradingFee order={order} textColor={textColor} />
    ) : (
      <SolanaBridgeEVMToSolanaTradingFee order={order} textColor={textColor} />
    )

    return <>{feeText}</>
  },
)
