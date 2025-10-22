import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { SmartRouter } from '@pancakeswap/smart-router'
import {
  AutoColumn,
  Box,
  Button,
  DottedHelpText,
  Flex,
  QuestionHelperV2,
  SwapHorizIcon,
  Text,
  WarningIcon,
  useTooltip,
} from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo as CurrencyLogoWidget } from '@pancakeswap/widgets-internal'
import { AutoRow, RowBetween, RowFixed } from 'components/Layout/Row'
import { useGasToken } from 'hooks/useGasToken'
import { memo, useMemo, useState } from 'react'
import { Field } from 'state/swap/actions'
import { styled } from 'styled-components'
import { warningSeverity } from 'utils/exchange'

import { PancakeSwapXTag } from 'components/PancakeSwapXTag'
import { paymasterInfo } from 'config/paymaster'
import { usePaymaster } from 'hooks/usePaymaster'
import { isAddressEqual } from 'utils'
import { SlippageAdjustedAmounts, TradePriceBreakdown, formatExecutionPrice } from 'views/Swap/V3Swap/utils/exchange'
import FormattedPriceImpact from 'views/Swap/components/FormattedPriceImpact'
import { SlippageButton } from 'views/Swap/components/SlippageButton'
import { StyledBalanceMaxMini, SwapCallbackError } from 'views/Swap/components/styleds'
import { BridgeOrderWithCommands, EVMInterfaceOrder, isBridgeOrder, isSolanaBridge, isXOrder } from 'views/Swap/utils'
import { SolanaBridgeTradingFee } from 'views/SwapSimplify/InfinitySwap/SolanaBridgeTradingFee'

import { BridgeOrder, OrderType } from '@pancakeswap/price-api-sdk'
import BigNumber from 'bignumber.js'
import { DISPLAY_PRECISION } from 'config/constants/formatting'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { currenciesUSDPriceAtom } from 'hooks/useCurrencyUsdPrice'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useAtomValue } from 'jotai'
import { notEmpty } from 'utils/notEmpty'
import { BridgeOrderFee, getBridgeOrderPriceImpact } from 'views/Swap/Bridge/utils'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { TotalFeeToolTip } from '../components/FeeToolTip'
import { EstimatedTime } from './components/EstimatedTime'

dayjs.extend(relativeTime)

const SwapModalFooterContainer = styled(AutoColumn)`
  margin-top: 24px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.default};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.background};
`

const SameTokenWarningBox = styled(Box)`
  font-size: 13px;
  background-color: #ffb2371a;
  padding: 10px;
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.yellow};
  border: 1px solid ${({ theme }) => theme.colors.yellow};
  border-radius: ${({ theme }) => theme.radii['12px']};
`

const StyledWarningIcon = styled(WarningIcon)`
  fill: ${({ theme }) => theme.colors.yellow};
`

const Badge = styled.span`
  font-size: 14px;
  padding: 1px 6px;
  user-select: none;
  border-radius: ${({ theme }) => theme.radii['32px']};
  color: ${({ theme }) => theme.colors.invertedContrast};
  background-color: ${({ theme }) => theme.colors.success};
`

function TotalBridgeFee({ priceBreakdown }: { priceBreakdown: BridgeOrderFee[] }) {
  const lpFeeAmounts = useMemo(() => {
    return priceBreakdown.map((p) => p?.lpFeeAmount).filter(notEmpty)
  }, [priceBreakdown])

  const currencies = useMemo(() => {
    return lpFeeAmounts.map((p) => p.currency)
  }, [lpFeeAmounts])

  const usdPrices = useAtomValue(currenciesUSDPriceAtom(currencies))

  const currencyUsdPrices = useMemo(() => {
    return lpFeeAmounts.map((lpFeeAmount, index) => {
      return new BigNumber(lpFeeAmount.toExact()).times(usdPrices[index] ?? 0)
    })
  }, [usdPrices, lpFeeAmounts])

  if (currencyUsdPrices.length === 0) {
    return (
      <Text fontSize="14px" textAlign="right">
        -
      </Text>
    )
  }

  return (
    <Text fontSize="14px" textAlign="right">
      {priceBreakdown.some((p) => p.type === OrderType.PCS_CLASSIC) ? '~' : ''}
      {formatDollarAmount(currencyUsdPrices.reduce((acc, curr) => acc.plus(curr), new BigNumber(0)).toNumber(), 3)}
    </Text>
  )
}

export const SwapModalFooterV3 = memo(function SwapModalFooterV3({
  priceBreakdown,
  inputAmount,
  outputAmount,
  order,
  tradeType,
  slippageAdjustedAmounts,
  isEnoughInputBalance,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: {
  order?: EVMInterfaceOrder
  tradeType: TradeType
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  priceBreakdown?: BridgeOrderFee[] | TradePriceBreakdown
  slippageAdjustedAmounts: SlippageAdjustedAmounts | undefined | null
  isEnoughInputBalance?: boolean
  swapErrorMessage?: string | undefined
  disabledConfirm: boolean

  onConfirm: () => void
}) {
  const { t } = useTranslation()
  const [showInverted, setShowInverted] = useState<boolean>(false)

  const { chainId } = useActiveChainId()

  const { switchNetwork } = useSwitchNetwork()

  const [gasToken] = useGasToken()
  const { isPaymasterAvailable, isPaymasterTokenActive } = usePaymaster()
  const gasTokenInfo = paymasterInfo[gasToken.isToken ? gasToken?.wrapped.address : '']

  const showSameTokenWarning = useMemo(
    () =>
      isPaymasterAvailable &&
      isPaymasterTokenActive &&
      gasTokenInfo?.discount !== 'FREE' &&
      inputAmount.currency?.wrapped.address &&
      !inputAmount.currency.isNative &&
      gasToken.isToken &&
      isAddressEqual(inputAmount.currency.wrapped.address, gasToken.wrapped.address),
    [inputAmount, gasToken, isPaymasterAvailable, isPaymasterTokenActive, gasTokenInfo],
  )

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    gasTokenInfo?.discount &&
      (gasTokenInfo.discount === 'FREE'
        ? t('Gas fees is fully sponsored')
        : t('%discount% discount on this gas fee token', { discount: gasTokenInfo.discount })),
  )

  const severity = warningSeverity(
    Array.isArray(priceBreakdown) ? getBridgeOrderPriceImpact(priceBreakdown) : priceBreakdown?.priceImpactWithoutFee,
  )

  const executionPriceDisplay = useMemo(() => {
    const price = SmartRouter.getExecutionPrice(order?.trade) ?? undefined
    return formatExecutionPrice(price, inputAmount, outputAmount, showInverted)
  }, [order, inputAmount, outputAmount, showInverted])

  const isWrongNetwork = useMemo(() => {
    return chainId && chainId !== order?.trade?.inputAmount?.currency?.chainId
  }, [chainId, order?.trade?.inputAmount?.currency?.chainId])

  return (
    <>
      <SwapModalFooterContainer>
        <RowBetween align="center" mb="8px">
          <Text color="textSubtle" fontSize="14px" ml="4px">
            {t('Price')}
          </Text>

          <Text
            fontSize="14px"
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '10px',
            }}
          >
            {executionPriceDisplay}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <SwapHorizIcon color="primary" width="20px" />
            </StyledBalanceMaxMini>
          </Text>
        </RowBetween>
        <RowBetween mb="8px">
          <RowFixed>
            <QuestionHelperV2
              ml="4px"
              placement="top"
              text={<>{t('The difference between the market price and your price due to trade size.')}</>}
            >
              <DottedHelpText fontSize="14px">{t('Price Impact')}</DottedHelpText>
            </QuestionHelperV2>
          </RowFixed>
          <FormattedPriceImpact isX={isXOrder(order)} priceImpact={getBridgeOrderPriceImpact(priceBreakdown)} />
        </RowBetween>
        {isXOrder(order) ||
        (isBridgeOrder(order) && (order as BridgeOrderWithCommands)?.commands?.length === 1) ? null : (
          <RowBetween mb="8px">
            <RowFixed>
              <QuestionHelperV2
                ml="4px"
                placement="top"
                text={t(
                  'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.',
                )}
              >
                <DottedHelpText fontSize="14px">{t('Slippage Tolerance')}</DottedHelpText>
              </QuestionHelperV2>
            </RowFixed>
            <SlippageButton enableAutoSlippage />
          </RowBetween>
        )}
        <RowBetween mb="8px">
          <RowFixed>
            <QuestionHelperV2
              text={t(
                'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
              )}
              ml="4px"
              placement="top"
            >
              <DottedHelpText fontSize="14px">
                {tradeType === TradeType.EXACT_INPUT ? t('Minimum received') : t('Maximum sold')}
              </DottedHelpText>
            </QuestionHelperV2>
          </RowFixed>
          <RowFixed>
            <Text fontSize="14px">
              {tradeType === TradeType.EXACT_INPUT
                ? formatAmount(slippageAdjustedAmounts?.[Field.OUTPUT], DISPLAY_PRECISION) ?? '-'
                : formatAmount(slippageAdjustedAmounts?.[Field.INPUT], DISPLAY_PRECISION) ?? '-'}
            </Text>
            <Text fontSize="14px" marginLeft="4px">
              {tradeType === TradeType.EXACT_INPUT ? outputAmount.currency.symbol : inputAmount.currency.symbol}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowBetween mt="2px">
          <RowFixed>
            <QuestionHelperV2 ml="4px" placement="top" text={<TotalFeeToolTip />}>
              <DottedHelpText fontSize="14px">{t('Total Fee')}</DottedHelpText>
            </QuestionHelperV2>
          </RowFixed>
          {isSolanaBridge(order) ? (
            <SolanaBridgeTradingFee order={order as BridgeOrder} showUSDFee />
          ) : Array.isArray(priceBreakdown) ? (
            <TotalBridgeFee priceBreakdown={priceBreakdown} />
          ) : priceBreakdown?.lpFeeAmount || isXOrder(order) ? (
            <Flex alignItems="center">
              {isXOrder(order) ? (
                <Text color="positive60" fontSize="16px" bold>
                  0
                </Text>
              ) : null}
              <Text fontSize="14px" ml="8px" strikeThrough={isXOrder(order)}>
                {formatAmount(priceBreakdown?.lpFeeAmount, 6)}
              </Text>
              <Text ml="4px" fontSize="14px">
                {inputAmount.currency.symbol}
              </Text>
            </Flex>
          ) : (
            <Text fontSize="14px" textAlign="right">
              -
            </Text>
          )}
        </RowBetween>
        {isBridgeOrder(order) && order.expectedFillTimeSec && (
          <RowBetween mt="8px">
            <RowFixed>
              <QuestionHelperV2
                ml="4px"
                placement="top"
                text={
                  <>
                    <Text>{t('Estimated time to complete this transaction')}</Text>
                  </>
                }
              >
                <DottedHelpText fontSize="14px">{t('Est. Time')}</DottedHelpText>
              </QuestionHelperV2>
            </RowFixed>
            <Text fontSize="14px" textAlign="right">
              <EstimatedTime expectedFillTimeSec={order.expectedFillTimeSec} />
            </Text>
          </RowBetween>
        )}
        {isXOrder(order) && (
          <RowBetween mt="8px">
            <RowFixed>
              <Text fontSize="14px">{t('Route')}</Text>
            </RowFixed>
            <PancakeSwapXTag fontSize="14px" />
          </RowBetween>
        )}
        {isPaymasterAvailable && isPaymasterTokenActive && (
          <RowBetween mt="8px">
            <RowFixed>
              <Text color="textSubtle" fontSize="14px">
                {t('Gas Token')}
              </Text>
              {gasTokenInfo && gasTokenInfo.discount && (
                <Badge
                  ref={targetRef}
                  style={{ fontSize: '12px', fontWeight: 600, padding: '3px 5px', marginLeft: '4px' }}
                >
                  ⛽️ {gasTokenInfo.discountLabel ?? gasTokenInfo.discount}
                </Badge>
              )}
              {tooltipVisible && tooltip}
            </RowFixed>

            <Flex alignItems="center">
              <Text marginRight={2} fontSize={14}>
                {(gasToken && gasToken.symbol && gasToken.symbol.length > 10
                  ? `${gasToken.symbol.slice(0, 4)}...${gasToken.symbol.slice(
                      gasToken.symbol.length - 5,
                      gasToken.symbol.length,
                    )}`
                  : gasToken?.symbol) || 'ETH'}
              </Text>

              <div style={{ position: 'relative' }}>
                <CurrencyLogoWidget currency={gasToken} />
                <p style={{ position: 'absolute', bottom: '-2px', left: '-6px', fontSize: '16px' }}>⛽️</p>
              </div>
            </Flex>
          </RowBetween>
        )}
      </SwapModalFooterContainer>

      {showSameTokenWarning && (
        <SameTokenWarningBox>
          <Flex>
            <StyledWarningIcon marginRight={2} />
            <span>
              {t(
                'Please ensure you leave enough tokens for gas fees when selecting the same token for gas as the input token',
              )}
            </span>
          </Flex>
        </SameTokenWarningBox>
      )}

      <AutoRow>
        <Button
          variant={severity > 2 ? 'danger' : 'primary'}
          onClick={() => {
            if (isWrongNetwork && order?.trade?.inputAmount?.currency?.chainId) {
              switchNetwork(order?.trade?.inputAmount?.currency?.chainId)
            } else {
              onConfirm()
            }
          }}
          disabled={disabledConfirm}
          mt="12px"
          id="confirm-swap-or-send"
          width="100%"
        >
          {isWrongNetwork
            ? t('Wrong Network')
            : severity > 2 || (tradeType === TradeType.EXACT_OUTPUT && !isEnoughInputBalance)
            ? t('Submit Order Anyway')
            : t('Submit Order')}
        </Button>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
})
