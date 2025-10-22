import { Button, Checkbox, ModalV2, MotionModal } from '@pancakeswap/uikit'
import { Collapse, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { ApiV3PoolInfoConcentratedItem } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import { useCallback, useEffect, useRef, useState, ChangeEvent, useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import AmountSlider from '@/components/AmountSlider'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import TokenInput from '@/components/TokenInput'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import useClmmBalance from '@/hooks/portfolio/clmm/useClmmBalance'
import { PositionWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import { useClmmRewardInfoFromSimulation } from '@/hooks/pool/clmm/useFetchClmmRewardInfo'
import { useAppStore, useClmmStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { debounce } from '@/utils/functionMethods'
import { formatCurrency, getFirstNonZeroDecimal } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import IntervalCircle, { IntervalCircleHandler } from '@/components/IntervalCircle'
import { SlippageAdjuster } from '@/components/SlippageAdjuster'
import { SlippageSettingField } from '@/components/SlippageAdjuster/SlippageSettingField'
import { useEvent } from '@/hooks/useEvent'
import { RpcPoolData } from '@/hooks/pool/clmm/useSubscribeClmmInfo'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import { panelCard } from '@/theme/cssBlocks'
import {
  logGTMPoolLiquiditySubCmfEvent,
  logGTMPoolLiquiditySubSuccessEvent,
  logGTMSolErrorLogEvent
} from '@/utils/report/curstomGTMEventTracking'
import toPercentString from '@/utils/numberish/toPercentString'
import { removeValidateSchema } from './validateSchema'

export default function RemoveLiquidityModal({
  isOpen,
  onClose,
  onSyncSending,
  onRefresh,
  poolInfo,
  position,
  allRewardInfos
}: {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
  onSyncSending: (val: boolean) => void
  poolInfo: ApiV3PoolInfoConcentratedItem
  position: PositionWithUpdateFn
  allRewardInfos: any[]
}) {
  const { t } = useTranslation()
  const isMobile = useAppStore((s) => s.isMobile)
  const wallet = useAppStore((s) => s.wallet)
  const featureDisabled = useAppStore((s) => s.featureDisabled.removeConcentratedPosition)
  const removeLiquidityAct = useClmmStore((s) => s.removeLiquidityAct)
  const { getPriceAndAmount } = useClmmBalance({})
  const sliderRef = useRef({ changeValue: (_val: number) => {} })
  const focusARef = useRef(true)
  const [decimalA, decimalB] = [poolInfo.mintA.decimals, poolInfo.mintB.decimals]
  const { amountSlippageA, amountSlippageB } = getPriceAndAmount({ poolInfo, position })
  const circleRef = useRef<IntervalCircleHandler>(null)
  const { isOpen: isSlippageOpen, onToggle: onToggleSlippage, onClose: onSlippageClose } = useDisclosure()

  const handleClick = useEvent(() => {
    circleRef.current?.restart()
    onRefresh?.()
  })

  const handleCloseModal = useEvent(() => {
    onClose()
    onSlippageClose()
  })

  const [sending, setIsSending] = useState(false)
  const [percent, setPercent] = useState(0)
  const [closePosition, setClosePosition] = useState(true)
  const [closePositionOpen, setClosePositionOpen] = useState(false)

  const [positionAmountA, positionAmountB] = [
    amountSlippageA.toDecimalPlaces(poolInfo.mintA.decimals, Decimal.ROUND_FLOOR).toString(),
    amountSlippageB.toDecimalPlaces(poolInfo.mintB.decimals, Decimal.ROUND_FLOOR).toString()
  ]
  const [tokenAmount, setTokenAmount] = useState(['', ''])
  const [minTokenAmount, setMinTokenAmount] = useState(['', ''])

  const handleFocusA = useCallback(() => {
    focusARef.current = true
  }, [])
  const handleFocusB = useCallback(() => {
    focusARef.current = false
  }, [])

  let error
  try {
    removeValidateSchema(t).validateSync({
      tokenAmount,
      positionAmountA,
      positionAmountB
    })
    error = undefined
  } catch (e: any) {
    error = e.message as string
  }

  const debounceSetPercent = useEvent(
    debounce((percent_: number) => {
      setPercent(percent_)
      sliderRef.current.changeValue(percent_)
    }, 100)
  )

  const handleAmountAChange = useCallback(
    (val: string) =>
      setTokenAmount(() => {
        if (!val) return ['', '']
        const inputRate = new Decimal(val).gte(positionAmountA) ? new Decimal(1) : Decimal.min(new Decimal(val).div(positionAmountA), 1)
        debounceSetPercent(inputRate.mul(100).toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber())
        return [val, new Decimal(positionAmountB).mul(inputRate).toDecimalPlaces(decimalB).toString()]
      }),
    [debounceSetPercent, positionAmountA, positionAmountB, decimalB]
  )
  const handleAmountBChange = useCallback(
    (val: string) => {
      setTokenAmount(() => {
        if (!val) return ['', '']
        const inputRate = new Decimal(val).gte(positionAmountB) ? new Decimal(1) : Decimal.min(new Decimal(val).div(positionAmountB), 1)
        debounceSetPercent(inputRate.mul(100).toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber())
        return [new Decimal(positionAmountA).mul(inputRate).toDecimalPlaces(decimalA).toString(), val]
      })
    },
    [debounceSetPercent, positionAmountA, positionAmountB, decimalA]
  )

  const debounceCalculate = useCallback(
    debounce((percent_: number) => {
      setTokenAmount([
        new Decimal(positionAmountA).mul(percent_).toDecimalPlaces(decimalA).toString(),
        new Decimal(positionAmountB).mul(percent_).toDecimalPlaces(decimalB).toString()
      ])
    }),
    [positionAmountA, positionAmountB, decimalA, decimalB]
  )

  const handlePercentChange = useCallback(
    (val: number) => {
      setPercent(Math.ceil(val))
      debounceCalculate(Math.ceil(val) / 100)
    },
    [debounceCalculate]
  )
  const handleClosePositionChange = useEvent((event: ChangeEvent<HTMLInputElement>) => {
    setClosePosition(!event.target.checked)
  })

  useEffect(() => {
    setPercent(0)
    setTokenAmount(['', ''])
  }, [isOpen])

  useEffect(() => {
    setClosePositionOpen(percent === 100)
  }, [percent])

  useEffect(() => {
    setMinTokenAmount([
      new Decimal(positionAmountA).mul(percent / 100).toString(),
      new Decimal(positionAmountB).mul(percent / 100).toString()
    ])
  }, [tokenAmount, percent, positionAmountA, positionAmountB])

  useEffect(() => {
    onSyncSending(sending)
    return () => onSyncSending(false)
  }, [sending, onSyncSending])

  useEffect(() => () => setClosePosition(true), [isOpen])

  const handleConfirm = useCallback(() => {
    logGTMPoolLiquiditySubCmfEvent()
    setIsSending(true)
    removeLiquidityAct({
      poolInfo,
      position,
      liquidity: new Decimal(position.liquidity.toString()).mul(percent / 100).toFixed(0),
      amountMinA: minTokenAmount[0],
      amountMinB: minTokenAmount[1],
      needRefresh: percent <= 100,
      closePosition: percent === 100 ? closePosition : undefined,
      onSent: () => {
        logGTMPoolLiquiditySubSuccessEvent({
          walletAddress: wallet?.adapter.publicKey?.toString() ?? '',
          token0: poolInfo.mintA.address,
          token1: poolInfo.mintB.address,
          token0Amt: minTokenAmount[0],
          token1Amt: minTokenAmount[1],
          feeTier: toPercentString(poolInfo.feeRate * 100)
        })
        setIsSending(false)
        setPercent(0)
        setTokenAmount(['', ''])
        setMinTokenAmount(['', ''])
        handleCloseModal()
      },
      onError: (e) => {
        logGTMSolErrorLogEvent({
          action: 'Remove Liquidity Fail',
          e
        })
        setIsSending(false)
      }
    })
  }, [closePosition, handleCloseModal, minTokenAmount, percent, poolInfo, position, removeLiquidityAct, wallet?.adapter.publicKey])

  const innerCardStyle = useMemo(
    () =>
      isMobile
        ? ({
            ...panelCard,
            borderBottomWidth: '1px',
            justifyContent: 'flex-start',
            flexDirection: 'column',
            p: '8px 16px',
            borderRadius: '16px',
            gap: 2
          } as const)
        : ({
            justifyContent: 'space-between',
            alignItems: 'center'
          } as const),
    [isMobile]
  )

  const validRewards = useMemo(
    () =>
      allRewardInfos.filter((r) => {
        return Number(r.amount) !== 0
      }),
    [allRewardInfos]
  )

  return (
    <ModalV2 isOpen={isOpen} onDismiss={handleCloseModal} closeOnOverlayClick>
      <MotionModal
        title={t('Remove Liquidity')}
        minWidth={[null, null, '500px']}
        headerPadding="12px 24px"
        headerBorderColor="transparent"
        bodyPadding={isMobile ? '0 16px 16px' : '0 24px 24px'}
        onDismiss={handleCloseModal}
      >
        <Flex flexDirection="column" gap={4} px={1}>
          <TokenInput
            ctrSx={{ w: '100%' }}
            sx={{ rounded: 24 }}
            size="sm"
            topBlockSx={{ px: '0', py: '4px' }}
            disableSelectToken
            hideControlButton
            token={poolInfo.mintA}
            readonly={featureDisabled}
            value={tokenAmount[0]}
            forceBalanceAmount={positionAmountA}
            onFocus={handleFocusA}
            onChange={handleAmountAChange}
          />
          <TokenInput
            ctrSx={{ w: '100%' }}
            sx={{ rounded: 24 }}
            size="sm"
            topBlockSx={{ px: '0', py: '4px' }}
            disableSelectToken
            hideControlButton
            token={poolInfo.mintB}
            readonly={featureDisabled}
            forceBalanceAmount={positionAmountB}
            onFocus={handleFocusB}
            value={tokenAmount[1]}
            onChange={handleAmountBChange}
          />
          <Flex flexDirection="column" gap={4} mt={[3, 4]}>
            <AmountSlider
              isRenderTopLeftLabel={false}
              actionRef={sliderRef}
              percent={percent}
              onChange={handlePercentChange}
              onHotChange={handlePercentChange}
              isDisabled={position.liquidity.isZero()}
            />
            <Flex align="center" justify={closePositionOpen ? 'space-between' : 'flex-end'} gap={3}>
              {closePositionOpen && (
                <HStack gap={1} alignItems="center">
                  <Checkbox scale="xs" checked={!closePosition} onChange={handleClosePositionChange} />
                  <Text fontSize="sm" color={colors.textSubtle}>
                    {t('Keep my position open')}
                  </Text>
                  <QuestionToolTip
                    iconType="info"
                    iconProps={{ color: colors.primary60 }}
                    label={t(
                      'You can remove all your tokens and still keep your position open in order to  add position seamless next time.'
                    )}
                  />
                </HStack>
              )}
              <Flex align="center" justify="flex-end" gap={3}>
                <SlippageAdjuster variant="liquidity" onClick={onToggleSlippage} />
                <IntervalCircle
                  componentRef={circleRef}
                  svgWidth={18}
                  strokeWidth={3}
                  trackStrokeColor={colors.textSecondary}
                  trackStrokeOpacity={0.5}
                  filledTrackStrokeColor={colors.textSecondary}
                  onClick={handleClick}
                  onEnd={onRefresh}
                />
              </Flex>
            </Flex>
            <Collapse in={isSlippageOpen} animateOpacity>
              <SlippageSettingField onClose={onSlippageClose} />
            </Collapse>
            <Flex {...panelCard} bg={colors.background} p={4} flexDirection="column" gap="2">
              <Text variant="subTitle" fontSize="xs" textTransform="uppercase">
                {t('You will receive:')}
              </Text>

              <Flex {...innerCardStyle}>
                <Flex alignItems="center" gap="2">
                  <Text fontSize="sm" color={colors.textSubtle}>
                    {t('Pooled assets')}
                  </Text>
                  <TokenAvatarPair size={['smi', 'smi']} token1={poolInfo.mintA} token2={poolInfo.mintB} />
                </Flex>
                <HStack fontSize={['xs', 'sm']} gap="1">
                  <Text>{formatCurrency(minTokenAmount[0], { decimalPlaces: getFirstNonZeroDecimal(minTokenAmount[0]) + 1 })}</Text>
                  <Text color={colors.textSubtle}>{getMintSymbol({ mint: poolInfo.mintA, transformSol: true })}</Text>
                  <Text>+</Text>
                  <Text>{formatCurrency(minTokenAmount[1], { decimalPlaces: getFirstNonZeroDecimal(minTokenAmount[1]) + 1 })}</Text>
                  <Text color={colors.textSubtle}>{getMintSymbol({ mint: poolInfo.mintB, transformSol: true })}</Text>
                </HStack>
              </Flex>

              {validRewards.length > 0 ? (
                <Flex {...innerCardStyle}>
                  <Flex alignItems="center" gap="2">
                    <Text fontSize="sm" color={colors.textSubtle}>
                      {t('Pending Yield')}
                    </Text>
                    <Flex>
                      {validRewards.map((r, idx) => (
                        <TokenAvatar key={r.mint.address} mr="-1" size="smi" token={r.mint} ml={idx ? '-2px' : '0'} />
                      ))}
                    </Flex>
                  </Flex>
                  <Flex fontSize="sm" gap="1">
                    {validRewards.map((r, idx) => {
                      return (
                        <HStack key={`reward-${r.mint.address}`} fontSize={['xs', 'sm']} gap="1">
                          {idx > 0 ? <Text>+</Text> : null}
                          <Text>
                            {formatCurrency(r.amount, {
                              decimalPlaces: getFirstNonZeroDecimal(r.amount) + 1,
                              maximumDecimalTrailingZeroes: 2
                            })}
                          </Text>
                          <Text color={colors.textSubtle}>{getMintSymbol({ mint: r.mint, transformSol: true })}</Text>
                        </HStack>
                      )
                    })}
                  </Flex>
                </Flex>
              ) : null}
            </Flex>
          </Flex>
        </Flex>
        <VStack mt="16px">
          <Button
            width="100%"
            disabled={featureDisabled || (!position.liquidity.isZero() && !!error)}
            isLoading={sending}
            onClick={handleConfirm}
          >
            {sending
              ? `${position.liquidity.isZero() ? t('Close Position') : t('Withdraw Liquidity')}...`
              : featureDisabled
              ? t('Disabled')
              : position.liquidity.isZero()
              ? t('Close Position')
              : error || t('Confirm')}
          </Button>
          <Button width="100%" variant="text" onClick={handleCloseModal}>
            <Text color={colors.textSubtle}>{t('Cancel')}</Text>
          </Button>
        </VStack>
      </MotionModal>
    </ModalV2>
  )
}
