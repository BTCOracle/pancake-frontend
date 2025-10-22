import { useIsMounted, useTheme } from '@pancakeswap/hooks'
import { PoolKey } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import {
  ArrowDownIcon,
  Box,
  Button,
  CardBody,
  Container,
  ErrorIcon,
  Flex,
  IconButton,
  Message,
  MessageText,
  PencilIcon,
  PreTitle,
  Text,
  Toggle,
  useModal,
} from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { LightGreyCard } from 'components/Card'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount/FormattedCurrencyAmount'
import { BinRangeSelector } from 'components/Liquidity/Form/BinRangeSelector'
import PageLoader from 'components/Loader/PageLoader'
import { CurrencyLogo } from 'components/Logo'
import { LIQUIDITY_PAGES } from 'config/constants/liquidity'
import { useInfinityBinPositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { usePositionIsFarming } from 'hooks/infinity/useIsFarming'
import { usePoolById } from 'hooks/infinity/usePool'
import { usePoolKeyByPoolId } from 'hooks/infinity/usePoolKeyByPoolId'
import { useBinRemoveLiquidity } from 'hooks/infinity/useRemoveBinLiquidity'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { useTransactionDeadline } from 'hooks/useTransactionDeadline'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccountInfinityBinPosition } from 'state/farmsV4/state/accountPositions/hooks/useAccountInfinityBinPositions'
import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { useBinRangeQueryState } from 'state/infinity/shared'
import { logGTMClickRemoveLiquidityEvent } from 'utils/customGTMEventTracking'
import { calculateSlippageAmount } from 'utils/exchange'
import { zeroAddress } from 'viem'
import { LiquidityTitle } from 'views/PositionDetails/components'
import { useAccount } from 'wagmi'
import { LiquiditySlippageButton, SlippageButton } from 'views/Swap/components/SlippageButton'
import { StyledBinCard, StyledInfoCard } from '../styled'
import { BinSlider } from './BinSlider'
import { NavBreadcrumbs } from './NavBreadcrumbs'

export const RemoveBinPosition = () => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const router = useRouter()
  const { theme } = useTheme()
  const { protocol, poolId } = useInfinityBinPositionIdRouteParams()
  const [, pool] = usePoolById<'Bin'>(poolId, chainId)
  const poolIdToPoolKey = usePoolKeyByPoolId(poolId, chainId, 'Bin')
  const poolKey = poolIdToPoolKey?.data as PoolKey<'Bin'> | undefined
  const [collectAsWrappedNative, setCollectAsWrappedNative] = useState(false)
  const { address: account } = useAccount()
  const { data: binPosition } = useAccountInfinityBinPosition(account, poolId, chainId)
  const isFarming = usePositionIsFarming({ chainId, poolId })

  const currency0 = pool?.token0
  const currency1 = pool?.token1
  const nativeCurrency = useNativeCurrency(chainId)

  const [, setBinQueryState] = useBinRangeQueryState()
  const [selectedBinNums, setSelectedBinNums] = useState<number[]>([
    binPosition?.minBinId ?? 0,
    binPosition?.maxBinId ?? 0,
  ])

  const amount0 = useMemo(() => {
    if (!currency0 || !binPosition) return undefined

    const [min, max] = selectedBinNums

    const reserveX = binPosition.reserveOfBins.reduce((acc, bin) => {
      if (bin.binId >= min && bin.binId <= max) {
        return acc + bin.reserveX
      }
      return acc
    }, 0n)

    return CurrencyAmount.fromRawAmount(currency0, reserveX ?? 0n)
  }, [binPosition, currency0, selectedBinNums])
  const amount1 = useMemo(() => {
    if (!currency1 || !binPosition) return undefined

    const [min, max] = selectedBinNums

    const reserveY = binPosition.reserveOfBins.reduce((acc, bin) => {
      if (bin.binId >= min && bin.binId <= max) {
        return acc + bin.reserveY
      }
      return acc
    }, 0n)
    return CurrencyAmount.fromRawAmount(currency1, reserveY ?? 0n)
  }, [binPosition, currency1, selectedBinNums])

  const enablePrice0 = useMemo(() => Boolean(amount0?.greaterThan(0)), [amount0])
  const enablePrice1 = useMemo(() => Boolean(amount1?.greaterThan(0)), [amount1])

  const price0 = useStablecoinPrice(currency0, { enabled: enablePrice0 })
  const price1 = useStablecoinPrice(currency1, { enabled: enablePrice1 })

  const removed = useMemo(() => {
    return binPosition?.reserveX === 0n && binPosition?.reserveY === 0n
  }, [binPosition])

  const error = useMemo(() => {
    if (!account) {
      return t('Connect Wallet')
    }
    return undefined
  }, [t, account])

  useEffect(() => {
    if (binPosition?.minBinId && binPosition?.maxBinId && !selectedBinNums[0] && !selectedBinNums[1]) {
      setSelectedBinNums([binPosition.minBinId, binPosition.maxBinId])
    }
  }, [binPosition, selectedBinNums])

  const handleBinRangeChanged = useCallback(
    (newValue: number | number[]) => {
      const [min, max] = Array.isArray(newValue) ? newValue : [newValue, newValue]
      setSelectedBinNums([min, max])
      setBinQueryState({ lowerBinId: min, upperBinId: max })
    },
    [setBinQueryState, setSelectedBinNums],
  )

  const { removeLiquidity: removeBinLiquidity, attemptingTx } = useBinRemoveLiquidity(chainId, account, () => {
    if (selectedBinNums[0] === binPosition?.minBinId && selectedBinNums[1] === binPosition.maxBinId) {
      router.push(LIQUIDITY_PAGES.POSITIONS)
    }
  })
  const [deadline] = useTransactionDeadline()
  const [allowedSlippage] = useUserSlippage()
  const wrapAddress = useMemo(() => {
    if (!currency0 || !currency1 || !collectAsWrappedNative) return zeroAddress
    if (currency0.isNative) return currency0.wrapped.address
    if (currency1.isNative) return currency1.wrapped.address

    return zeroAddress
  }, [collectAsWrappedNative, currency0, currency1])

  const handleRemoveLiquidity = useCallback(async () => {
    if (!pool || !account || !poolKey || !binPosition?.reserveOfBins) return
    const selectedBins = binPosition.reserveOfBins.filter(
      (bin) => bin.binId >= selectedBinNums[0] && bin.binId <= selectedBinNums[1],
    )
    const ids = selectedBins.map((bin) => bin.binId)
    const amounts = selectedBins.map((bin) => bin.userSharesOfBin)
    const amountX = CurrencyAmount.fromRawAmount(
      pool.token0,
      selectedBins.reduce((acc, bin) => acc + bin.reserveX, 0n),
    )
    const amountY = CurrencyAmount.fromRawAmount(
      pool.token1,
      selectedBins.reduce((acc, bin) => acc + bin.reserveY, 0n),
    )
    const amount0Min = calculateSlippageAmount(amountX, allowedSlippage)[0]
    const amount1Min = calculateSlippageAmount(amountY, allowedSlippage)[0]
    console.debug('debug bin position', binPosition.reserveOfBins)
    await removeBinLiquidity({
      poolKey,
      ids,
      amounts,
      amount0Min,
      amount1Min,
      wrapAddress,
      hookData: undefined,
      deadline: deadline ?? BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes,
    })
  }, [
    account,
    allowedSlippage,
    binPosition?.reserveOfBins,
    deadline,
    pool,
    poolKey,
    removeBinLiquidity,
    selectedBinNums,
    wrapAddress,
  ])

  const [{ lowerBinId, upperBinId }] = useBinRangeQueryState()
  const invalidRange = useMemo(() => {
    if (!lowerBinId || !upperBinId) return true
    if (lowerBinId > upperBinId) return true
    if (
      (binPosition?.minBinId && lowerBinId < binPosition.minBinId) ||
      (binPosition?.maxBinId && lowerBinId > binPosition.maxBinId)
    )
      return true

    if (
      (binPosition?.minBinId && upperBinId < binPosition.minBinId) ||
      (binPosition?.maxBinId && upperBinId > binPosition.maxBinId)
    )
      return true

    return false
  }, [binPosition?.maxBinId, binPosition?.minBinId, lowerBinId, upperBinId])

  useEffect(() => {
    if (
      !invalidRange &&
      lowerBinId &&
      upperBinId &&
      (selectedBinNums[0] !== lowerBinId || selectedBinNums[1] !== upperBinId)
    ) {
      setSelectedBinNums([lowerBinId, upperBinId])
    }
  }, [binPosition?.maxBinId, binPosition?.minBinId, invalidRange, lowerBinId, selectedBinNums, upperBinId])

  const isMounted = useIsMounted()
  useEffect(() => {
    if (isMounted && binPosition?.minBinId && binPosition?.maxBinId && (lowerBinId === null || upperBinId === null)) {
      setBinQueryState({ lowerBinId: binPosition.minBinId, upperBinId: binPosition.maxBinId })
    }
  }, [binPosition?.maxBinId, binPosition?.minBinId, isMounted, lowerBinId, setBinQueryState, upperBinId])

  const submitDisabled = useMemo(() => {
    if (attemptingTx || removed || Boolean(error)) return true

    if (!amount0 || !amount1) return true

    if (amount0.asFraction.add(amount1.asFraction).equalTo(0)) return true

    return false
  }, [attemptingTx, removed, error, amount0, amount1])

  const showCollectAsWNative = useMemo(
    () => Boolean(currency0 && currency1 && (currency0.isNative || currency1.isNative)),
    [currency0, currency1],
  )

  if (!chainId || !poolId || !pool) {
    return <PageLoader />
  }

  return (
    <Container width={['100%', '100%', '100%', '80rem']}>
      <NavBreadcrumbs currency0={currency0} currency1={currency1}>
        <Text>{t('Remove Liquidity')}</Text>
      </NavBreadcrumbs>

      <StyledBinCard mt="24px" mx="auto">
        <CardBody>
          <Flex alignItems="center">
            <LiquidityTitle
              showPoolFeature={false}
              poolId={poolId}
              protocol={protocol}
              currency0={currency0}
              currency1={currency1}
              chainId={chainId}
              feeTier={pool?.fee}
              dynamic={pool?.dynamic}
              size="sm"
              displayLabelOnMobile={false}
              isFarming={isFarming}
              isRemoved={removed}
              isOutOfRange={binPosition?.status === POSITION_STATUS.INACTIVE}
            />
          </Flex>

          <PreTitle mt="24px" textTransform="uppercase">
            {t('Amount of liquidity to remove')}
          </PreTitle>
          <StyledInfoCard mt="8px">
            <PreTitle textTransform="uppercase">{t('price range')}</PreTitle>
            {/* <pre>
              {stringify(
                {
                  min: selectedBinNums[0],
                  max: selectedBinNums[1],
                  lowerBinId,
                  upperBinId,
                  l: binPosition?.minBinId !== lowerBinId || binPosition?.maxBinId !== upperBinId,
                  invalidRange,
                  binPosition,
                },
                null,
                2,
              )}
            </pre> */}
            {binPosition?.minBinId && binPosition?.maxBinId ? (
              <>
                {binPosition.maxBinId - binPosition.minBinId > 1 ? (
                  <Box height="48px" my="8px">
                    <BinSlider
                      defaultValue={[binPosition.minBinId, binPosition.maxBinId]}
                      min={binPosition.minBinId}
                      max={binPosition.maxBinId}
                      value={selectedBinNums}
                      step={1}
                      onChange={handleBinRangeChanged}
                    />
                  </Box>
                ) : null}

                <BinRangeSelector
                  currency0={currency0}
                  currency1={currency1}
                  binStep={pool?.binStep}
                  activeBinId={pool.activeId}
                  minBinId={binPosition?.minBinId}
                  maxBinId={binPosition?.maxBinId}
                />
              </>
            ) : null}
          </StyledInfoCard>

          <Flex mt="24px" mb="8px" justifyContent="center">
            <ArrowDownIcon width="24px" color="textSubtle" />
          </Flex>

          <PreTitle mt="24px" textTransform="uppercase">
            {t('You will receive')}
          </PreTitle>

          <LightGreyCard mt="8px">
            <Flex justifyContent="space-between" as="label" alignItems="center">
              <Flex alignItems="center">
                <CurrencyLogo currency={currency0} />
                <Text color="textSubtle" id="remove-liquidity-tokena-symbol" ml="4px">
                  {t('Pooled')} {currency0?.symbol}
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
                  {t('Pooled')} {currency1?.symbol}
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
          </LightGreyCard>
          <Message variant="primary" mt="16px" mb="8px">
            <Text fontSize="14px">
              {t('Displayed amounts include fees. In LBAMM pools, accrued fees are added back to the pool reserves.')}
            </Text>
          </Message>
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

          {invalidRange ? (
            <Box mt="8px">
              <Message variant="warning">
                <MessageText>{t('Invalid range selected.')}</MessageText>
              </Message>
            </Box>
          ) : null}

          <Button
            disabled={submitDisabled}
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
      </StyledBinCard>
    </Container>
  )
}
