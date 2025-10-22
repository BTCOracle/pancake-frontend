import {
  ChevronDownIcon,
  FlexGap,
  IconButton,
  InfoIcon,
  ModalV2,
  QuestionHelperV2,
  Svg,
  SvgProps,
  SwapHorizIcon,
  SwapLoading,
  useModalV2
} from '@pancakeswap/uikit'
import styled from 'styled-components'
import { Box, Collapse, Flex, HStack, Skeleton, Text } from '@chakra-ui/react'
import { TokenInfo } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import AddressChip from '@/components/AddressChip'
import { IntervalCircleHandler } from '@/components/IntervalCircle'
import TokenAvatar from '@/components/TokenAvatar'
import Tooltip from '@/components/Tooltip'
import useTokenInfo from '@/hooks/token/useTokenInfo'
import CircleCheckBreaker from '@/icons/misc/CircleCheckBreaker'
import WarningIcon from '@/icons/misc/WarningIcon'
import { colors } from '@/theme/cssVariables'
import { formatCurrency, formatToRawLocaleStr, trimTrailZero } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { getMintSymbol } from '@/utils/token'
import { ApiSwapV1OutSuccess, QuoteResponseData } from '../type'
import { RoutesDisplayModal } from './RoutesDisplayModal'

export function SwapInfoBoard({
  amountIn,
  tokenInput,
  tokenOutput,
  isComputing,
  computedSwapResult,
  onRefresh
}: {
  amountIn: string
  tokenInput?: TokenInfo
  tokenOutput?: TokenInfo
  isComputing: boolean
  computedSwapResult?: QuoteResponseData
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const [showMoreSwapInfo, setShowMoreSwapInfo] = useState(false)
  const refreshCircleRef = useRef<IntervalCircleHandler>(null)
  const routeTokens = tokenInput && tokenOutput ? [tokenInput, tokenOutput] : undefined
  const isBaseOut = computedSwapResult?.swapType === 'exactOut'
  const priceImpact = computedSwapResult?.priceImpactPct || 0
  const isHighRiskPrice = priceImpact > 5

  /* useEffect(() => {
    onRefresh()
  }, [tokenInput?.address, tokenOutput?.address, amountIn]) */

  return (
    <>
      <Box
        position="relative"
        boxShadow={isHighRiskPrice ? `0px 0px 12px 6px rgba(255, 78, 163, 0.15)` : 'none'}
        bg={isHighRiskPrice ? 'rgba(255, 78, 163,0.1)' : undefined}
        borderWidth="1px"
        borderStyle="solid"
        borderColor={isHighRiskPrice ? colors.semanticError : colors.backgroundTransparent12}
        rounded="2xl"
        px={4}
        pt={2}
        pb={2.5}
      >
        {/* Top utils */}
        <HStack gap={4} py={2} justifyContent="space-between">
          <PriceDetector
            computedSwapResult={computedSwapResult}
            isComputing={isComputing}
            tokenInput={tokenInput}
            tokenOutput={tokenOutput}
          />
          <RefreshButton loading={isComputing} onClick={onRefresh} />
        </HStack>
        <HStack gap={4} py={1} justifyContent="space-between">
          <ItemLabel
            name={isBaseOut ? t('Maximum sold') : t('Minimum Received')}
            tooltip={
              isBaseOut
                ? t('The maximum number of tokens you will input on this trade')
                : t('The minimum number of tokens you will receive. This is determined by your slippage tolerance.')
            }
          />
          <MinimumReceiveValue tokenOutput={isBaseOut ? tokenInput : tokenOutput} amount={computedSwapResult?.otherAmountThreshold || ''} />
        </HStack>
        <HStack gap={4} py={1} justifyContent="space-between">
          <ItemLabel
            name={t('Price Impact')}
            tooltip={t('The difference between the current market price and estimated price due to trade size')}
          />
          <Text
            fontSize="14px"
            color={isHighRiskPrice ? colors.semanticError : priceImpact > 1 ? colors.semanticWarning : colors.positive60}
          >
            {computedSwapResult
              ? `${formatToRawLocaleStr(toPercentString(computedSwapResult.priceImpactPct, { notShowZero: true }))}`
              : '-'}
          </Text>
        </HStack>
        <Collapse in={showMoreSwapInfo} animateOpacity>
          <HStack gap={4} py={1} justifyContent="space-between">
            <ItemLabel name={t('Order Routing')} tooltip={t('This route gave the best price for your trade')} />
            {routeTokens && <RoutingValue routeStats={computedSwapResult?.routeStats} routePlan={computedSwapResult?.routePlan || []} />}
          </HStack>

          <HStack gap={4} py={1} justifyContent="space-between">
            <ItemLabel name={t('Estimated Fees')} tooltip={t('Swap fees go to LPs, CAKE burns, and treasury')} />
            <Box textAlign="end" fontSize="xs" color={colors.textPrimary}>
              <RouteFees routeStats={computedSwapResult?.routeStats} routePlan={computedSwapResult?.routePlan || []} />
            </Box>
          </HStack>
        </Collapse>
        <HStack color={colors.textSecondary} fontSize="xs" spacing={0.5} justify="center" onClick={() => setShowMoreSwapInfo((b) => !b)}>
          <Text align="center" cursor="pointer" fontSize="14px" color={colors.textPrimary}>
            {showMoreSwapInfo ? t('Less info') : t('More info')}
          </Text>
          {/* arrow */}
          <Box transform={`rotate(${showMoreSwapInfo ? `${180}deg` : 0})`} transition="300ms">
            <ChevronDownIcon width="24px" height="24px" color="secondary" />
          </Box>
        </HStack>
      </Box>
    </>
  )
}

function PriceDetector({
  isComputing,
  tokenInput,
  tokenOutput,
  computedSwapResult
}: {
  isComputing: boolean
  tokenInput?: TokenInfo
  tokenOutput?: TokenInfo
  computedSwapResult?: QuoteResponseData
}) {
  const [reverse, setReverse] = useState(false)
  const { t } = useTranslation()

  const priceImpact = computedSwapResult
    ? computedSwapResult.priceImpactPct > 5
      ? 'high'
      : computedSwapResult.priceImpactPct > 1
      ? 'warning'
      : 'low'
    : undefined

  let price = computedSwapResult
    ? trimTrailZero(
        new Decimal(computedSwapResult.outputAmount)
          .div(10 ** (tokenOutput?.decimals || 0))
          .div(new Decimal(computedSwapResult.inputAmount).div(10 ** (tokenInput?.decimals || 0)))
          .toFixed(tokenOutput?.decimals || 0, Decimal.ROUND_FLOOR)
      )!
    : ''
  if (reverse)
    price =
      price === ''
        ? price
        : new Decimal(1)
            .div(price)
            .toDecimalPlaces(tokenInput?.decimals || 0, Decimal.ROUND_FLOOR)
            .toString()

  return (
    <HStack>
      <Text as="div" color={colors.textPrimary} fontWeight={500}>
        <Flex gap="1" alignItems="center" flexWrap="wrap" maxW={['80%', 'none']}>
          <Text fontSize="14px" as="div">
            1
          </Text>
          <Text fontSize="14px" as="div">
            {reverse ? tokenOutput?.symbol : tokenInput?.symbol}
          </Text>
          <Box onClick={() => setReverse((b) => !b)} color={colors.textSecondary} cursor="pointer">
            <SwapHorizIcon color="primary" width="18px" height="18px" />
          </Box>
          {!isComputing ? (
            <Text as="div" fontSize="14px">
              {reverse
                ? formatCurrency(price, { decimalPlaces: tokenInput?.decimals || 0 })
                : formatCurrency(price, { decimalPlaces: tokenOutput?.decimals || 0 })}
            </Text>
          ) : (
            <Skeleton rounded="2xl" width={`${12 * ((reverse ? tokenInput?.decimals : tokenOutput?.decimals) || 1)}px`} height="24px" />
          )}
          <Text as="div" fontSize="14px">
            {reverse ? tokenInput?.symbol : tokenOutput?.symbol}
          </Text>
        </Flex>
      </Text>
      <Tooltip label={priceImpact === 'low' ? t('Low Price Impact') : t('Price Impact Warning')}>
        {priceImpact === 'low' ? (
          <CircleCheckBreaker />
        ) : priceImpact === 'warning' ? (
          <WarningIcon />
        ) : priceImpact === 'high' ? (
          <WarningIcon stroke={colors.semanticError} />
        ) : null}
      </Tooltip>
    </HStack>
  )
}

const DetailsTitle = styled(Text)`
  text-decoration: underline dotted;
  font-size: 14px;
  color: ${colors.textSubtle};
  line-height: 150%;
  cursor: help;
`

function ItemLabel({ name, tooltip }: { name: string; tooltip?: string | null }) {
  return (
    <QuestionHelperV2 text={tooltip}>
      <DetailsTitle>{name}</DetailsTitle>
    </QuestionHelperV2>
  )
}

function RefreshButton({
  // refreshCircleRef,
  loading,
  onClick
}: {
  // refreshCircleRef: RefObject<IntervalCircleHandler>
  loading: boolean
  onClick?(): void
}) {
  return (
    <Flex>
      <IconButton
        variant="text"
        scale="sm"
        disabled={loading}
        onClick={onClick}
        data-dd-action-name="Swap refresh button"
        style={{ backgroundColor: loading ? 'transparent' : undefined, transform: 'rotate(-45deg)' }}
      >
        {loading ? <SwapLoading /> : <RefreshIcon color="textSubtle" innerColor="#02919D" width="20px" duration={60 * 1000} />}
      </IconButton>
    </Flex>
  )
}

const DisabledIcon = (props: SvgProps) => (
  <Svg id="arrow_loading" viewBox="0 0 24 24" {...props}>
    <path
      stroke="none"
      fill="#D7CAEC"
      d="M16.2751 7.78995C13.932 5.44681 10.133 5.44681 7.78986 7.78995C7.02853 8.55128 6.51457 9.4663 6.24798 10.4351C6.24473 10.4499 6.24114 10.4646 6.23719 10.4793C6.17635 10.7064 6.12938 10.9339 6.09577 11.161C5.83159 12.9457 6.39255 14.7026 7.52624 15.9944C7.61054 16.0901 7.69842 16.1838 7.78986 16.2752C8.08307 16.5685 8.39909 16.825 8.7322 17.0448C9.25533 17.3892 9.84172 17.6568 10.4798 17.8278C10.7386 17.8971 10.9979 17.9484 11.2565 17.9825C12.9537 18.2061 14.6187 17.6866 15.8747 16.6415C16.0123 16.5265 16.1459 16.4044 16.2751 16.2752C16.2848 16.2655 16.2947 16.2561 16.3047 16.2469C17.0123 15.531 17.5491 14.627 17.8283 13.5851C17.9712 13.0517 18.5196 12.7351 19.053 12.878C19.5865 13.021 19.9031 13.5693 19.7602 14.1028C19.3141 15.7676 18.3745 17.1684 17.1409 18.1899C16.1883 18.9822 15.0949 19.5189 13.9515 19.8002C11.8607 20.3147 9.6028 19.9749 7.7328 18.7809C7.06855 18.3579 6.47841 17.8432 5.97519 17.2589C5.12341 16.2738 4.55173 15.1302 4.26015 13.9324C4.01698 12.9416 3.96104 11.8931 4.12168 10.8379C4.36697 9.20484 5.1183 7.63309 6.37564 6.37574C9.49984 3.25154 14.5652 3.25154 17.6894 6.37574L18.2332 6.91959L18.2337 5.49951C18.2338 5.05769 18.5921 4.69964 19.034 4.69979C19.4758 4.69995 19.8338 5.05825 19.8337 5.50007L19.8325 9.03277L19.8322 9.8325L19.0325 9.83249L18.9401 9.83249C18.8146 9.85665 18.6854 9.85665 18.5599 9.83248L15.5005 9.83245C15.0587 9.83245 14.7005 9.47427 14.7005 9.03244C14.7005 8.59062 15.0587 8.23245 15.5005 8.23245L16.7176 8.23246L16.2751 7.78995Z"
    />
    <defs>
      <path
        id="arrow"
        stroke="none"
        fill="none"
        d="M16.2751 7.78995C13.932 5.44681 10.133 5.44681 7.78986 7.78995C7.02853 8.55128 6.51457 9.4663 6.24798 10.4351C6.24473 10.4499 6.24114 10.4646 6.23719 10.4793C6.17635 10.7064 6.12938 10.9339 6.09577 11.161C5.83159 12.9457 6.39255 14.7026 7.52624 15.9944C7.61054 16.0901 7.69842 16.1838 7.78986 16.2752C8.08307 16.5685 8.39909 16.825 8.7322 17.0448C9.25533 17.3892 9.84172 17.6568 10.4798 17.8278C10.7386 17.8971 10.9979 17.9484 11.2565 17.9825C12.9537 18.2061 14.6187 17.6866 15.8747 16.6415C16.0123 16.5265 16.1459 16.4044 16.2751 16.2752C16.2848 16.2655 16.2947 16.2561 16.3047 16.2469C17.0123 15.531 17.5491 14.627 17.8283 13.5851C17.9712 13.0517 18.5196 12.7351 19.053 12.878C19.5865 13.021 19.9031 13.5693 19.7602 14.1028C19.3141 15.7676 18.3745 17.1684 17.1409 18.1899C16.1883 18.9822 15.0949 19.5189 13.9515 19.8002C11.8607 20.3147 9.6028 19.9749 7.7328 18.7809C7.06855 18.3579 6.47841 17.8432 5.97519 17.2589C5.12341 16.2738 4.55173 15.1302 4.26015 13.9324C4.01698 12.9416 3.96104 11.8931 4.12168 10.8379C4.36697 9.20484 5.1183 7.63309 6.37564 6.37574C9.49984 3.25154 14.5652 3.25154 17.6894 6.37574L18.2332 6.91959L18.2337 5.49951C18.2338 5.05769 18.5921 4.69964 19.034 4.69979C19.4758 4.69995 19.8338 5.05825 19.8337 5.50007L19.8325 9.03277L19.8322 9.8325L19.0325 9.83249L18.9401 9.83249C18.8146 9.85665 18.6854 9.85665 18.5599 9.83248L15.5005 9.83245C15.0587 9.83245 14.7005 9.47427 14.7005 9.03244C14.7005 8.59062 15.0587 8.23245 15.5005 8.23245L16.7176 8.23246L16.2751 7.78995Z"
      />
      <clipPath id="arrow-clip">
        <use xlinkHref="#arrow" />
      </clipPath>
    </defs>
  </Svg>
)

const RefreshIcon = ({
  disabled,
  duration,
  innerColor,
  ...props
}: SvgProps & { disabled?: boolean; duration?: number | string; innerColor?: string }) =>
  disabled ? (
    <DisabledIcon {...props} />
  ) : (
    <Svg id="arrow_loading" viewBox="0 0 24 24" {...props}>
      <path
        stroke="none"
        fill={innerColor || '#7A6EAA'}
        d="M16.2751 7.78995C13.932 5.44681 10.133 5.44681 7.78986 7.78995C7.02853 8.55128 6.51457 9.4663 6.24798 10.4351C6.24473 10.4499 6.24114 10.4646 6.23719 10.4793C6.17635 10.7064 6.12938 10.9339 6.09577 11.161C5.83159 12.9457 6.39255 14.7026 7.52624 15.9944C7.61054 16.0901 7.69842 16.1838 7.78986 16.2752C8.08307 16.5685 8.39909 16.825 8.7322 17.0448C9.25533 17.3892 9.84172 17.6568 10.4798 17.8278C10.7386 17.8971 10.9979 17.9484 11.2565 17.9825C12.9537 18.2061 14.6187 17.6866 15.8747 16.6415C16.0123 16.5265 16.1459 16.4044 16.2751 16.2752C16.2848 16.2655 16.2947 16.2561 16.3047 16.2469C17.0123 15.531 17.5491 14.627 17.8283 13.5851C17.9712 13.0517 18.5196 12.7351 19.053 12.878C19.5865 13.021 19.9031 13.5693 19.7602 14.1028C19.3141 15.7676 18.3745 17.1684 17.1409 18.1899C16.1883 18.9822 15.0949 19.5189 13.9515 19.8002C11.8607 20.3147 9.6028 19.9749 7.7328 18.7809C7.06855 18.3579 6.47841 17.8432 5.97519 17.2589C5.12341 16.2738 4.55173 15.1302 4.26015 13.9324C4.01698 12.9416 3.96104 11.8931 4.12168 10.8379C4.36697 9.20484 5.1183 7.63309 6.37564 6.37574C9.49984 3.25154 14.5652 3.25154 17.6894 6.37574L18.2332 6.91959L18.2337 5.49951C18.2338 5.05769 18.5921 4.69964 19.034 4.69979C19.4758 4.69995 19.8338 5.05825 19.8337 5.50007L19.8325 9.03277L19.8322 9.8325L19.0325 9.83249L18.9401 9.83249C18.8146 9.85665 18.6854 9.85665 18.5599 9.83248L15.5005 9.83245C15.0587 9.83245 14.7005 9.47427 14.7005 9.03244C14.7005 8.59062 15.0587 8.23245 15.5005 8.23245L16.7176 8.23246L16.2751 7.78995Z"
      />
      <defs>
        <path
          id="arrow"
          stroke="none"
          fill="none"
          d="M16.2751 7.78995C13.932 5.44681 10.133 5.44681 7.78986 7.78995C7.02853 8.55128 6.51457 9.4663 6.24798 10.4351C6.24473 10.4499 6.24114 10.4646 6.23719 10.4793C6.17635 10.7064 6.12938 10.9339 6.09577 11.161C5.83159 12.9457 6.39255 14.7026 7.52624 15.9944C7.61054 16.0901 7.69842 16.1838 7.78986 16.2752C8.08307 16.5685 8.39909 16.825 8.7322 17.0448C9.25533 17.3892 9.84172 17.6568 10.4798 17.8278C10.7386 17.8971 10.9979 17.9484 11.2565 17.9825C12.9537 18.2061 14.6187 17.6866 15.8747 16.6415C16.0123 16.5265 16.1459 16.4044 16.2751 16.2752C16.2848 16.2655 16.2947 16.2561 16.3047 16.2469C17.0123 15.531 17.5491 14.627 17.8283 13.5851C17.9712 13.0517 18.5196 12.7351 19.053 12.878C19.5865 13.021 19.9031 13.5693 19.7602 14.1028C19.3141 15.7676 18.3745 17.1684 17.1409 18.1899C16.1883 18.9822 15.0949 19.5189 13.9515 19.8002C11.8607 20.3147 9.6028 19.9749 7.7328 18.7809C7.06855 18.3579 6.47841 17.8432 5.97519 17.2589C5.12341 16.2738 4.55173 15.1302 4.26015 13.9324C4.01698 12.9416 3.96104 11.8931 4.12168 10.8379C4.36697 9.20484 5.1183 7.63309 6.37564 6.37574C9.49984 3.25154 14.5652 3.25154 17.6894 6.37574L18.2332 6.91959L18.2337 5.49951C18.2338 5.05769 18.5921 4.69964 19.034 4.69979C19.4758 4.69995 19.8338 5.05825 19.8337 5.50007L19.8325 9.03277L19.8322 9.8325L19.0325 9.83249L18.9401 9.83249C18.8146 9.85665 18.6854 9.85665 18.5599 9.83248L15.5005 9.83245C15.0587 9.83245 14.7005 9.47427 14.7005 9.03244C14.7005 8.59062 15.0587 8.23245 15.5005 8.23245L16.7176 8.23246L16.2751 7.78995Z"
        />
        <clipPath id="arrow-clip">
          <use xlinkHref="#arrow" />
        </clipPath>
      </defs>
      <g clipPath="url(#arrow-clip)">
        <circle
          cx="12"
          cy="12"
          r="5"
          transform="rotate(365,12,12)"
          fill="none"
          stroke="#D7CAEC"
          strokeWidth="16"
          strokeDasharray="30"
          strokeDashoffset="0"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;-30"
            begin="arrow_loading.click; 0.7s"
            repeatCount="indefinite"
            dur={`${duration || 6.3}s`}
          />
        </circle>
      </g>
      <use xlinkHref="#arrow" />
      <animateTransform
        id="transform_0"
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 0 0"
        to="-10 0 0"
        dur="0.07s"
        begin="arrow_loading.click;"
        repeatCount="1"
      />
      <animateTransform
        id="transform_1"
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="-45 0 0"
        to="390 0 0"
        dur="0.6s"
        begin="transform_0.end"
        repeatCount="1"
      />
      <animateTransform
        id="transform_2"
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="390 0 0"
        to="360 0 0"
        dur="0.15s"
        begin="transform_1.end"
        repeatCount="1"
      />
    </Svg>
  )

function MinimumReceiveValue({ tokenOutput, amount }: { tokenOutput?: TokenInfo; amount: string }) {
  return (
    <HStack fontSize="14px">
      <Text color={colors.textPrimary}>
        {amount && tokenOutput
          ? formatCurrency(new Decimal(amount).div(10 ** tokenOutput.decimals).toFixed(tokenOutput.decimals, Decimal.ROUND_FLOOR), {
              decimalPlaces: tokenOutput?.decimals
            })
          : formatCurrency(amount)}
      </Text>
      <Text color={colors.textPrimary}>{tokenOutput?.symbol}</Text>
    </HStack>
  )
}

function RoutingValue({
  routePlan,
  routeStats
}: {
  routePlan: QuoteResponseData['routePlan'] | undefined
  routeStats: QuoteResponseData['routeStats'] | undefined
}) {
  const { t } = useTranslation()
  const { isOpen, setIsOpen, onDismiss } = useModalV2()

  if (!routePlan || !routeStats) return null

  if (routeStats?.numSubRoutes === 1) {
    return (
      <HStack spacing={0.5} minH="32px">
        {routePlan.map(({ inputMint, outputMint, feeRate, poolId }, idx) => (
          <Fragment key={inputMint}>
            <Tooltip label={<AddressChip address={inputMint} textProps={{ fontSize: 'xs' }} canExternalLink />}>
              <TokenAvatar tokenMint={inputMint} size="sm" />
            </Tooltip>
            <Tooltip
              label={
                <AddressChip
                  address={poolId}
                  renderLabel={<Text fontSize="xs">AMM ID:</Text>}
                  textProps={{ fontSize: 'xs' }}
                  canExternalLink
                />
              }
            >
              <Text fontSize="2xs" color={colors.textSecondary}>
                {formatToRawLocaleStr(toPercentString(feeRate / 10000))}
              </Text>
            </Tooltip>

            {idx !== routePlan.length - 1 && <Text color={colors.textTertiary}>▸</Text>}
            {idx === routePlan.length - 1 && (
              <>
                <Text color={colors.textTertiary}>▸</Text>
                <Tooltip label={<AddressChip address={outputMint} textProps={{ fontSize: 'xs' }} canExternalLink />}>
                  <TokenAvatar tokenMint={outputMint} size="sm" />
                </Tooltip>
              </>
            )}
          </Fragment>
        ))}
      </HStack>
    )
  }

  return (
    <>
      <FlexGap alignItems="center" onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }}>
        <Text fontSize="14px" color={colors.textPrimary}>
          {t('%count% Separate Routes', { count: routeStats?.numSubRoutes })}
        </Text>
        <IconButton variant="text" color="primary60" scale="xs">
          <InfoIcon width="16px" height="16px" color="primary60" />
        </IconButton>
      </FlexGap>
      <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick maxWidth="320px" minHeight="500px">
        <RoutesDisplayModal routePlan={routePlan} routeStats={routeStats} />
      </ModalV2>
    </>
  )
}

function FeeItem({
  route
}: {
  route: {
    feeMint: string
    feeAmount: string
    [key: string]: any
  }
}) {
  const { tokenInfo } = useTokenInfo({ mint: route.feeMint })
  if (!tokenInfo) return null
  return (
    <Flex alignItems="center" justifyContent="space-between" gap="1">
      {formatCurrency(
        new Decimal(route.feeAmount)
          .div(10 ** tokenInfo.decimals)
          .toDecimalPlaces(tokenInfo.decimals, Decimal.ROUND_FLOOR)
          .toString(),
        {
          decimalPlaces: tokenInfo.decimals
        }
      )}
      <Text>{getMintSymbol({ mint: tokenInfo, transformSol: true })}</Text>
    </Flex>
  )
}

const RouteFees = ({
  routePlan,
  routeStats
}: {
  routePlan: QuoteResponseData['routePlan'] | undefined
  routeStats: QuoteResponseData['routeStats'] | undefined
}) => {
  if (!routePlan || !routeStats) return null

  if (routeStats.numSubRoutes === 1) {
    return routePlan.map((route) => {
      return <FeeItem key={route.poolId} route={route} />
    })
  }
  /* eslint-disable no-param-reassign */
  const feeMap = routePlan.reduce((acc, route) => {
    if (acc[route.feeMint]) {
      acc[route.feeMint] += Number(route.feeAmount)
    } else {
      acc[route.feeMint] = Number(route.feeAmount)
    }
    return acc
  }, {} as Record<string, number>)
  /* eslint-enable no-param-reassign */

  const feeItems = Object.entries(feeMap).map(([feeMint, feeAmount]) => {
    return <FeeItem key={feeMint} route={{ feeMint, feeAmount: feeAmount.toString() }} />
  })

  return <>{feeItems}</>
}
