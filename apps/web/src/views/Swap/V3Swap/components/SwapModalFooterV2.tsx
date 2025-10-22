import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent, TradeType, UnifiedCurrencyAmount } from '@pancakeswap/sdk'
import { SmartRouter } from '@pancakeswap/smart-router'
import {
  AutoColumn,
  BackForwardIcon,
  Box,
  Button,
  DottedHelpText,
  Flex,
  Link,
  QuestionHelperV2,
  Text,
  WarningIcon,
  useMatchBreakpoints,
  useTooltip,
} from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo as CurrencyLogoWidget } from '@pancakeswap/widgets-internal'
import { AutoRow, RowBetween, RowFixed } from 'components/Layout/Row'
import { useGasToken } from 'hooks/useGasToken'
import { memo, useMemo, useState } from 'react'
import { Field } from 'state/swap/actions'
import { styled } from 'styled-components'
import { warningSeverity } from 'utils/exchange'
import { SVMTradingFee } from 'views/SwapSimplify/InfinitySwap/TradingFee'
import { SolanaBridgeTradingFee } from 'views/SwapSimplify/InfinitySwap/SolanaBridgeTradingFee'

import { PancakeSwapXTag } from 'components/PancakeSwapXTag'
import { paymasterInfo } from 'config/paymaster'
import { usePaymaster } from 'hooks/usePaymaster'
import { isAddressEqual } from 'utils'
import { SlippageButton } from 'views/Swap/components/SlippageButton'
import { InterfaceOrder, isBridgeOrder, isSolanaBridge, isSVMOrder, isXOrder } from 'views/Swap/utils'
import { useHasDynamicHook } from 'views/SwapSimplify/hooks/useHasDynamicHook'
import { BridgeOrder } from '@pancakeswap/price-api-sdk'
import FormattedPriceImpact from '../../components/FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from '../../components/styleds'
import { SlippageAdjustedAmounts, formatExecutionPrice } from '../utils/exchange'

const SwapModalFooterContainer = styled(AutoColumn)`
  margin-top: 12px;
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

export const SwapModalFooterV2 = memo(function SwapModalFooterV2({
  priceImpact: priceImpactWithoutFee,
  lpFee: realizedLPFee,
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
  order?: InterfaceOrder
  tradeType: TradeType
  lpFee?: CurrencyAmount<Currency>
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  priceImpact?: Percent
  slippageAdjustedAmounts: SlippageAdjustedAmounts | undefined | null
  isEnoughInputBalance?: boolean
  swapErrorMessage?: string | undefined
  disabledConfirm: boolean
  onConfirm: () => void
}) {
  const { t } = useTranslation()
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const { isMobile } = useMatchBreakpoints()

  const [gasToken] = useGasToken()
  const { isPaymasterAvailable, isPaymasterTokenActive } = usePaymaster()
  const gasTokenInfo = paymasterInfo[gasToken.isToken ? gasToken?.wrapped.address : '']
  const hasDynamicHook = useHasDynamicHook(order)

  const displayDecimals = isMobile ? 6 : 12

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

  const severity = warningSeverity(priceImpactWithoutFee)

  const executionPriceDisplay = useMemo(() => {
    const price =
      SmartRouter.getExecutionPrice({
        // TODO: to remove as CurrencyAmount, SmartRouter will be updated to use UnifiedCurrencyAmount
        inputAmount: order?.trade?.inputAmount as CurrencyAmount<Currency>,
        outputAmount: order?.trade?.outputAmount as CurrencyAmount<Currency>,
      }) ?? undefined
    return formatExecutionPrice(price, inputAmount, outputAmount, showInverted)
  }, [order, inputAmount, outputAmount, showInverted])

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
              <BackForwardIcon color="primary" width="14px" />
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
          <FormattedPriceImpact isX={isXOrder(order)} priceImpact={priceImpactWithoutFee} />
        </RowBetween>
        {!isXOrder(order) && !isBridgeOrder(order) && (
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
                ? formatAmount(slippageAdjustedAmounts?.[Field.OUTPUT], displayDecimals) ?? '-'
                : formatAmount(slippageAdjustedAmounts?.[Field.INPUT], displayDecimals) ?? '-'}
            </Text>
            <Text fontSize="14px" marginLeft="4px">
              {tradeType === TradeType.EXACT_INPUT ? outputAmount.currency.symbol : inputAmount.currency.symbol}
            </Text>
          </RowFixed>
        </RowBetween>

        <RowBetween mt="2px">
          <RowFixed>
            <QuestionHelperV2
              ml="4px"
              placement="top"
              text={
                <>
                  <Text>
                    {t('Trading fee varies by pool fee tier. Check it via the magnifier icon under "Route."')}
                  </Text>
                  <Text mt="12px">
                    <Link
                      style={{ display: 'inline' }}
                      ml="4px"
                      external
                      href="https://docs.pancakeswap.finance/products/pancakeswap-exchange/faq#what-will-be-the-trading-fee-breakdown-for-v3-exchange"
                    >
                      {t('Fee Breakdown and Tokenomics')}
                    </Link>
                  </Text>
                </>
              }
            >
              <DottedHelpText fontSize="14px">{t('Trading Fee')}</DottedHelpText>
            </QuestionHelperV2>
          </RowFixed>
          {isSolanaBridge(order) ? (
            <SolanaBridgeTradingFee order={order as BridgeOrder} showUSDFee />
          ) : isSVMOrder(order) && inputAmount?.currency?.symbol ? (
            <SVMTradingFee routes={order.trade.routes} inputCurrencySymbol={inputAmount.currency.symbol} />
          ) : realizedLPFee || isXOrder(order) ? (
            <Flex alignItems="center">
              {isXOrder(order) ? (
                <Text color="positive60" fontSize="16px" bold>
                  0
                </Text>
              ) : null}
              {hasDynamicHook ? (
                <QuestionHelperV2 text={t('This route uses a dynamic fee pool; actual fees may vary.')}>
                  <Flex style={{ textDecoration: 'underline dotted', cursor: 'help' }}>
                    <Text fontSize="14px" ml="8px" strikeThrough={isXOrder(order)}>
                      ~{formatAmount(realizedLPFee, 6)}
                    </Text>
                    <Text ml="4px" fontSize="14px">
                      {inputAmount.currency.symbol}
                    </Text>
                  </Flex>
                </QuestionHelperV2>
              ) : (
                <>
                  <Text fontSize="14px" ml="8px" strikeThrough={isXOrder(order)}>
                    {formatAmount(realizedLPFee, 6)}
                  </Text>
                  <Text ml="4px" fontSize="14px">
                    {inputAmount.currency.symbol}
                  </Text>
                </>
              )}
            </Flex>
          ) : (
            <Text fontSize="14px" textAlign="right">
              -
            </Text>
          )}
        </RowBetween>
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
          onClick={onConfirm}
          disabled={disabledConfirm}
          mt="12px"
          id="confirm-swap-or-send"
          width="100%"
        >
          {severity > 2 || (tradeType === TradeType.EXACT_OUTPUT && !isEnoughInputBalance)
            ? t('Swap Anyway')
            : t('Confirm Swap')}
        </Button>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
})
