/* eslint-disable jsx-a11y/anchor-is-valid */
import { useTheme } from '@pancakeswap/hooks'
import { getPoolId } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { zeroAddress } from '@pancakeswap/price-api-sdk'
import { LiquiditySlippageButton, SlippageButton } from 'views/Swap/components/SlippageButton'
import { Percent } from '@pancakeswap/swap-sdk-core'
import {
  ArrowDownIcon,
  Button,
  CardBody,
  Container,
  ErrorIcon,
  Flex,
  FlexGap,
  Message,
  PreTitle,
  Slider,
  Text,
  Toggle,
} from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { LightGreyCard } from 'components/Card'
import Divider from 'components/Divider'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount/FormattedCurrencyAmount'
import PageLoader from 'components/Loader/PageLoader'
import { CurrencyLogo } from 'components/Logo'
import { INITIAL_ALLOWED_SLIPPAGE } from 'config/constants'
import { LIQUIDITY_PAGES } from 'config/constants/liquidity'
import { useInfinityClammPositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { useFeesEarned } from 'hooks/infinity/useFeesEarned'
import { useInfinityClPositionFromTokenId } from 'hooks/infinity/useInfinityPositions'
import { usePositionIsFarming } from 'hooks/infinity/useIsFarming'
import { usePoolById } from 'hooks/infinity/usePool'
import { usePositionAmount } from 'hooks/infinity/usePositionAmount'
import { useRemoveClLiquidity } from 'hooks/infinity/useRemoveClLiquidity'
import { useCurrencyByChainId } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { logGTMClickRemoveLiquidityEvent } from 'utils/customGTMEventTracking'
import { calculateSlippageAmount } from 'utils/exchange'
import { maxUint128 } from 'viem'
import { LiquidityTitle } from 'views/PositionDetails/components'
import { useAccount } from 'wagmi'
import { PRESET_PERCENT } from '../constants'
import { StyledCard, StyledInfoCard } from '../styled'
import { NavBreadcrumbs } from './NavBreadcrumbs'

/**
 * Infinity Remove Liquidity
 */
export const RemoveClPosition = () => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const router = useRouter()
  const { theme } = useTheme()

  const { tokenId, protocol } = useInfinityClammPositionIdRouteParams()

  const { position } = useInfinityClPositionFromTokenId(tokenId, chainId)
  const { poolKey, token0: token0Address, token1: token1Address, fee, liquidity, tickLower, tickUpper } = position || {}
  const removed = position?.liquidity === 0n

  const currency0 = useCurrencyByChainId(token0Address, chainId)
  const currency1 = useCurrencyByChainId(token1Address, chainId)
  const poolId = useMemo(() => (poolKey ? getPoolId(poolKey) : undefined), [poolKey])
  const [, pool] = usePoolById<'CL'>(poolId, chainId)
  const isFarming = usePositionIsFarming({ chainId, poolId })

  const nativeCurrency = useNativeCurrency(chainId)

  const [percent, setPercent] = useState(50)
  const [collectAsWrappedNative, setCollectAsWrappedNative] = useState(false)

  const { amount0: allAmount0, amount1: allAmount1 } = usePositionAmount({
    token0: currency0,
    token1: currency1,
    tickCurrent: pool?.tickCurrent,
    tickLower,
    tickUpper,
    sqrtRatioX96: pool?.sqrtRatioX96,
    liquidity,
  })

  const [amount0, amount1] = useMemo(
    () => [allAmount0?.multiply(new Percent(percent, 100)), allAmount1?.multiply(new Percent(percent, 100))],
    [allAmount0, allAmount1, percent],
  )

  const [feeValue0, feeValue1] = useFeesEarned({
    currency0,
    currency1,
    tokenId: tokenId ? BigInt(tokenId) : undefined,
    poolId,
    tickLower,
    tickUpper,
  })

  const enablePrice0 = useMemo(
    () => Boolean(amount0?.greaterThan(0) || feeValue0?.greaterThan(0)),
    [amount0, feeValue0],
  )
  const enablePrice1 = useMemo(
    () => Boolean(amount1?.greaterThan(0) || feeValue1?.greaterThan(0)),
    [amount1, feeValue1],
  )

  const price0 = useStablecoinPrice(currency0, { enabled: enablePrice0 })
  const price1 = useStablecoinPrice(currency1, { enabled: enablePrice1 })

  const wrapAddress = useMemo(() => {
    if (!collectAsWrappedNative) return zeroAddress
    if (currency0?.isNative) {
      return currency0?.wrapped.address ?? zeroAddress
    }
    if (currency1?.isNative) {
      return currency1?.wrapped.address ?? zeroAddress
    }
    return zeroAddress
  }, [
    collectAsWrappedNative,
    currency0?.isNative,
    currency0?.wrapped.address,
    currency1?.isNative,
    currency1?.wrapped.address,
  ])

  const isValidPercentValue = useMemo(() => percent > 0 && percent <= 100, [percent])

  const handlePercentChanged = useCallback(
    (newValue: number) => {
      setPercent(Math.ceil(newValue))
    },
    [setPercent],
  )

  const { address: account } = useAccount()
  const { removeLiquidity: removeCLLiquidity, attemptingTx } = useRemoveClLiquidity(chainId, account, () => {
    if (percent === 100) {
      router.push(LIQUIDITY_PAGES.POSITIONS)
    }
  })

  const [allowedSlippage] = useUserSlippage() || [INITIAL_ALLOWED_SLIPPAGE]

  const handleRemoveLiquidity = useCallback(async () => {
    if (!position || !tokenId) return

    const [amount0Min] = amount0 ? calculateSlippageAmount(amount0, allowedSlippage) : [maxUint128]
    const [amount1Min] = amount1 ? calculateSlippageAmount(amount1, allowedSlippage) : [maxUint128]

    await removeCLLiquidity({
      tokenId: BigInt(tokenId),
      poolKey: position.poolKey,
      liquidity: (position.liquidity * BigInt(percent)) / 100n,
      amount0Min,
      amount1Min,
      wrapAddress,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes,
    })
  }, [position, tokenId, amount0, allowedSlippage, amount1, removeCLLiquidity, percent, wrapAddress])

  const error = useMemo(() => {
    if (!account) {
      return t('Connect Wallet')
    }
    if (percent === 0) {
      return t('Enter a percent')
    }
    return undefined
  }, [t, account, percent])

  const showCollectAsWNative = useMemo(
    () => Boolean(currency0 && currency1 && (currency0.isNative || currency1.isNative)),
    [currency0, currency1],
  )

  const [currency0Symbol, currency1Symbol] = useMemo(
    () =>
      collectAsWrappedNative
        ? [currency0?.wrapped.symbol, currency1?.wrapped.symbol]
        : [currency0?.symbol, currency1?.symbol],
    [
      collectAsWrappedNative,
      currency0?.symbol,
      currency1?.symbol,
      currency0?.wrapped.symbol,
      currency1?.wrapped.symbol,
    ],
  )

  // Show loading animation while we wait for chainId
  if (!chainId || !position || !tokenId) {
    return <PageLoader />
  }

  return (
    <Container width={['100%', '100%', '100%', '60rem']}>
      <NavBreadcrumbs currency0={currency0} currency1={currency1}>
        <Text>{t('Remove Liquidity')}</Text>
      </NavBreadcrumbs>

      <StyledCard mt="24px" mx="auto">
        <CardBody>
          <Flex alignItems="center">
            <LiquidityTitle
              showPoolFeature={false}
              poolId={poolId}
              tokenId={tokenId ? BigInt(tokenId) : undefined}
              protocol={protocol}
              currency0={currency0}
              currency1={currency1}
              chainId={chainId}
              feeTier={fee}
              dynamic={pool?.dynamic}
              displayLabelOnMobile={false}
              size="sm"
              isFarming={isFarming}
              isRemoved={removed}
              isOutOfRange={position?.status === POSITION_STATUS.INACTIVE}
            />
          </Flex>

          <PreTitle mt="24px" textTransform="uppercase">
            {t('Amount of liquidity to remove')}
          </PreTitle>
          <StyledInfoCard mt="8px">
            <Text fontSize="32px" bold>
              {percent}%
            </Text>
            <Slider min={0} max={100} name="remove-position" value={percent} onValueChanged={handlePercentChanged} />
            <FlexGap mt="16px" gap="8px" justifyContent="space-between">
              {PRESET_PERCENT.map((presetPercent) => (
                <Button
                  variant="secondary"
                  scale={['xs', null, null, 'sm']}
                  width="100%"
                  key={presetPercent}
                  onClick={() => setPercent(presetPercent)}
                >
                  {presetPercent === 100 ? t('MAX') : `${presetPercent}%`}
                </Button>
              ))}
            </FlexGap>
          </StyledInfoCard>

          <Flex mt="24px" mb="8px" justifyContent="center">
            <ArrowDownIcon width="24px" color="textSubtle" />
          </Flex>

          <>
            <PreTitle mt="24px" textTransform="uppercase">
              {t('You will receive')}
            </PreTitle>
            <LightGreyCard mt="8px">
              <Flex justifyContent="space-between" as="label" alignItems="center">
                <Flex alignItems="center">
                  <CurrencyLogo currency={currency0} />
                  <Text color="textSubtle" id="remove-liquidity-tokena-symbol" ml="4px">
                    {t('Pooled')} {currency0Symbol}
                  </Text>
                </Flex>
                <Flex>
                  <FormattedCurrencyAmount currencyAmount={amount0} />
                </Flex>
              </Flex>
              <Flex justifyContent="flex-end" mb="8px">
                <Text fontSize="14px" color="textSubtle" ml="4px">
                  ~${formatNumber(amount0?.multiply(price0 ?? 0).toExact() ?? 0)}
                </Text>
              </Flex>

              <Flex justifyContent="space-between" as="label" alignItems="center">
                <Flex alignItems="center">
                  <CurrencyLogo currency={currency1} />
                  <Text color="textSubtle" id="remove-liquidity-tokena-symbol" ml="4px">
                    {t('Pooled')} {currency1Symbol}
                  </Text>
                </Flex>
                <Flex>
                  <FormattedCurrencyAmount currencyAmount={amount1} />
                </Flex>
              </Flex>
              <Flex justifyContent="flex-end" mb="8px">
                <Text fontSize="14px" color="textSubtle" ml="4px">
                  ~${formatNumber(amount1?.multiply(price1 ?? 0).toExact() ?? 0)}
                </Text>
              </Flex>
              <Divider style={{ margin: '16px 0' }} />
              <Flex justifyContent="space-between" as="label" alignItems="center">
                <Flex alignItems="center">
                  <CurrencyLogo currency={feeValue0?.currency} />
                  <Text small color="textSubtle" id="remove-liquidity-tokena-symbol" ml="4px">
                    {currency0Symbol} {t('Fee Earned')}
                  </Text>
                </Flex>
                <Flex>
                  <FormattedCurrencyAmount currencyAmount={feeValue0} />
                </Flex>
              </Flex>
              <Flex justifyContent="flex-end" mb="8px">
                <Text fontSize="14px" color="textSubtle" ml="4px">
                  ~${formatNumber(feeValue0?.multiply(price0 ?? 0).toExact() ?? 0)}
                </Text>
              </Flex>
              <Flex justifyContent="space-between" as="label" alignItems="center">
                <Flex alignItems="center">
                  <CurrencyLogo currency={feeValue1?.currency} />
                  <Text small color="textSubtle" id="remove-liquidity-tokena-symbol" ml="4px">
                    {currency1Symbol} {t('Fee Earned')}
                  </Text>
                </Flex>
                <Flex>
                  <FormattedCurrencyAmount currencyAmount={feeValue1} />
                </Flex>
              </Flex>
              <Flex justifyContent="flex-end" mb="8px">
                <Text fontSize="14px" color="textSubtle" ml="4px">
                  ~${formatNumber(feeValue1?.multiply(price1 ?? 0).toExact() ?? 0)}
                </Text>
              </Flex>
            </LightGreyCard>
          </>
          <Flex mt="24px" justifyContent="space-between" alignItems="center">
            <Message
              icon={<ErrorIcon color="yellow" />}
              variant="warning"
              style={{ padding: '12px', borderColor: theme.colors.v2Warning20 }}
            >
              <Text fontSize="14px">
                {t(
                  'This pool may charge a fee for liquidity actions. Adjust slippage tolerance under Settings as needed.',
                )}
              </Text>
            </Message>
          </Flex>
          <Flex mt="24px" justifyContent="space-between" alignItems="center">
            <Text>{t('Slippage Tolerance')}</Text>
            <LiquiditySlippageButton />
          </Flex>

          {showCollectAsWNative && (
            <Flex mt="24px" justifyContent="space-between" alignItems="center">
              <Text>
                {t('Collect as %nativeSymbol%', {
                  nativeSymbol: nativeCurrency.wrapped.symbol,
                })}
              </Text>
              <Toggle
                scale="sm"
                checked={collectAsWrappedNative}
                onChange={() => setCollectAsWrappedNative(!collectAsWrappedNative)}
              />
            </Flex>
          )}

          <Button
            disabled={attemptingTx || removed || Boolean(error) || !isValidPercentValue}
            width="100%"
            mt="24px"
            onClick={() => {
              handleRemoveLiquidity()
              logGTMClickRemoveLiquidityEvent()
            }}
          >
            {removed ? t('Closed') : error ?? t('Remove')}
          </Button>
        </CardBody>
      </StyledCard>
    </Container>
  )
}
