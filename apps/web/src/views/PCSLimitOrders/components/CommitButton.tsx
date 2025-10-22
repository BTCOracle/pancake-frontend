import { useTranslation } from '@pancakeswap/localization'
import {
  ArrowForwardIcon,
  AutoColumn,
  Box,
  Button,
  ErrorIcon,
  FlexGap,
  IconButton,
  Message,
  ModalV2,
  MotionModal,
  RowBetween,
  SwapHorizIcon,
  Text,
  useModalV2,
} from '@pancakeswap/uikit'
import { DualCurrencyDisplay, LightGreyCard } from '@pancakeswap/widgets-internal'
import { useAtomValue } from 'jotai'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { BigNumber as BN } from 'bignumber.js'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useCurrencyBalances } from 'state/wallet/hooks'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS } from 'config/constants/supportChains'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { formattedAmountsAtom } from '../state/form/inputAtoms'
import { Field, ValidationError } from '../types/limitOrder.types'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { amountReceivedAtom, feesEarnedUSDAtom } from '../state/form/tradeDetailsAtoms'
import { commitButtonEnabledAtom } from '../state/form/validationAtoms'
import { customMarketPriceAtom } from '../state/form/customMarketPriceAtom'
import { currentMarketPriceAtom } from '../state/form/currentMarketPriceAtom'
import { usePlaceLimitOrder } from '../hooks/usePlaceLimitOrder'
import { useLimitOrderApproval } from '../hooks/useLimitOrderApproval'
import { selectedPoolAtom } from '../state/pools/selectedPoolAtom'
import { useLimitOrderUserBalance } from '../hooks/useLimitOrderUserBalance'
import { ticksAtom } from '../state/form/ticksAtom'
import { getSymbolDecimals } from '../constants/decimalConfig'

export const CommitButton = () => {
  const { t } = useTranslation()
  const { isOpen, onDismiss, onOpen } = useModalV2()

  const { account, chainId } = useAccountActiveChain()
  const { switchNetwork } = useSwitchNetwork()
  const isWrongNetwork = !LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId)

  const { approvalState, approveCallback } = useLimitOrderApproval()
  const { isEnoughBalance, showMinimumUSDWarning } = useLimitOrderUserBalance()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const formattedAmounts = useAtomValue(formattedAmountsAtom)
  const ticksData = useAtomValue(ticksAtom)
  const { isSellingOrBuyingAtWorsePrice } = ticksData || { isSellingOrBuyingAtWorsePrice: false }

  const { enabled, errorReason } = useAtomValue(commitButtonEnabledAtom)

  const isEnabled = enabled && isEnoughBalance && !showMinimumUSDWarning && !isSellingOrBuyingAtWorsePrice

  const { refetch } = useAtomValue(selectedPoolAtom)

  const showApproveButton =
    isEnabled && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)

  const buttonText = useMemo(() => {
    if (BN(formattedAmounts[Field.CURRENCY_A]).gt(0) && !isEnoughBalance)
      return t('Insufficient %symbol% balance', { symbol: inputCurrency?.symbol ?? '' })

    if (errorReason === ValidationError.NO_LIQUIDITY) return t('Insufficient Liquidity')

    return t('Place Limit Order')
  }, [errorReason, t, isEnoughBalance, showMinimumUSDWarning, inputCurrency?.symbol, formattedAmounts])

  const handleOpen = useCallback(() => {
    // Refetch pool to get latest market price
    refetch()

    onOpen()
  }, [onOpen, refetch])

  if (!account) {
    return <ConnectWalletButton />
  }

  if (isWrongNetwork) {
    return <Button onClick={() => switchNetwork(LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS[0])}>{t('Switch Network')}</Button>
  }

  return (
    <>
      {showApproveButton && (
        <Button onClick={approveCallback} disabled={approvalState === ApprovalState.PENDING}>
          {approvalState === ApprovalState.PENDING
            ? t('Approving...')
            : t('Approve %symbol%', { symbol: inputCurrency?.symbol ?? '' })}
        </Button>
      )}

      {!showApproveButton && (
        <Button onClick={handleOpen} disabled={!isEnabled}>
          {buttonText}
        </Button>
      )}
      <Suspense>
        <PreviewModal isOpen={isOpen} onDismiss={onDismiss} />
      </Suspense>
    </>
  )
}

interface PreviewModalProps {
  isOpen: boolean
  onDismiss: () => void
}
const PreviewModal = ({ isOpen, onDismiss }: PreviewModalProps) => {
  const { t } = useTranslation()

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <MotionModal
        title={t('Place Limit Order')}
        headerBorderColor="transparent"
        bodyPadding="0 24px 24px"
        maxWidth={[null, null, null, '440px']}
      >
        <Suspense>
          <ConfirmOrderContent onDismiss={onDismiss} />
        </Suspense>
      </MotionModal>
    </ModalV2>
  )
}

const ConfirmOrderContent = ({ onDismiss }: { onDismiss: () => void }) => {
  const { t } = useTranslation()
  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const formattedAmounts = useAtomValue(formattedAmountsAtom)
  const amountADisplay = formatNumber(BN(formattedAmounts[Field.CURRENCY_A]).toNumber(), { maxDecimalDisplayDigits: 6 })
  const amountBDisplay = formatNumber(BN(formattedAmounts[Field.CURRENCY_B]).toNumber(), { maxDecimalDisplayDigits: 6 })

  const currentMarketPrice_ = useAtomValue(currentMarketPriceAtom)
  const customMarketPrice_ = useAtomValue(customMarketPriceAtom)

  // Display accurate price from ticks data
  const ticksData = useAtomValue(ticksAtom)
  const currentMarketPrice = ticksData
    ? ticksData.sqrtPrice.toFixed(getSymbolDecimals(outputCurrency?.symbol))
    : currentMarketPrice_
  const customMarketPrice = ticksData
    ? ticksData.sqrtPrice.toFixed(getSymbolDecimals(outputCurrency?.symbol))
    : customMarketPrice_

  const feesEarnedData = useAtomValue(feesEarnedUSDAtom)
  const feesEarnedUSD = feesEarnedData?.feesEarnedUSD
  const amountReceived = useAtomValue(amountReceivedAtom)

  // TODO in future: Handle success and error inside modal content
  const { placeOrder, isPlacingOrder } = usePlaceLimitOrder({ onError: onDismiss, onSuccess: onDismiss })

  const [isInverted, setIsInverted] = useState(false)
  const quotePrice = useMemo(() => {
    const price = customMarketPrice || currentMarketPrice
    const priceBN = BN(price || 0)

    if (!price || priceBN.isZero()) return undefined

    if (isInverted) {
      return BN(1).dividedBy(priceBN).toFixed(getSymbolDecimals(outputCurrency?.symbol))
    }
    return priceBN.toFixed(getSymbolDecimals(outputCurrency?.symbol))
  }, [customMarketPrice, currentMarketPrice, isInverted, outputCurrency])

  return (
    <Box mt="4px">
      <Box px="32px">
        <DualCurrencyDisplay
          inputCurrency={inputCurrency ?? undefined}
          outputCurrency={outputCurrency ?? undefined}
          inputAmount={amountADisplay}
          outputAmount={amountBDisplay}
          inputChainName={getFullChainNameById(inputCurrency?.chainId)}
          outputChainName={getFullChainNameById(outputCurrency?.chainId)}
          overrideIcon={<ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />}
        />
      </Box>

      <LightGreyCard mt="24px" padding="16px">
        <AutoColumn gap="12px">
          <RowBetween>
            <Text color="textSubtle" small>
              {t('Limit Price')}
            </Text>
            <FlexGap alignItems="center" gap="4px">
              <Text small> 1 {isInverted ? outputCurrency?.symbol : inputCurrency?.symbol} </Text>
              <IconButton onClick={() => setIsInverted(!isInverted)} variant="text" scale="xs">
                <SwapHorizIcon width="18px" height="18px" color="primary60" />
              </IconButton>
              <Text small>
                {' '}
                {quotePrice} {isInverted ? inputCurrency?.symbol : outputCurrency?.symbol}{' '}
              </Text>
            </FlexGap>
          </RowBetween>

          <RowBetween>
            <Text color="textSubtle" small>
              {t('Fees Earned')}
            </Text>
            <Text small>
              {feesEarnedUSD
                ? `$${formatNumber(feesEarnedUSD, { maxDecimalDisplayDigits: 4, maximumSignificantDigits: 8 })}`
                : '-'}
            </Text>
          </RowBetween>

          <RowBetween>
            <Text color="textSubtle" small>
              {t('Amount Received')}
            </Text>
            <Text small>
              {amountReceived
                ? `${formatNumber(amountReceived, {
                    maxDecimalDisplayDigits: getSymbolDecimals(outputCurrency?.symbol),
                    maximumSignificantDigits: 8,
                  })} ${outputCurrency?.symbol}`
                : '-'}
            </Text>
          </RowBetween>
        </AutoColumn>
      </LightGreyCard>

      <Message
        mt="16px"
        padding="12px"
        variant="warning"
        icon={<ErrorIcon width="24px" height="24px" color="v2Warning50" />}
      >
        <Text small>
          {t(
            'Liquidity will be added at the tick closest to your specified limit price. The limit order may not execute exactly when the token price reaches your specified value on external markets.',
          )}
        </Text>
      </Message>

      <Button mt="16px" width="100%" onClick={placeOrder} disabled={isPlacingOrder}>
        {isPlacingOrder ? `${t('Confirming')}...` : t('Confirm')}
      </Button>
    </Box>
  )
}
