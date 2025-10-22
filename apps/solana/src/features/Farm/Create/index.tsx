import { Box, Flex, Grid, GridItem, HStack, Link, Text, useDisclosure } from '@chakra-ui/react'
import { ApiV3PoolInfoConcentratedItem, ApiV3PoolInfoItem, ApiV3PoolInfoStandardItem } from '@pancakeswap/solana-core-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { PublicKey } from '@solana/web3.js'
import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import Steps, { StepsRef } from '@/components/Steps'
import SubPageNote from '@/components/SubPageNote'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useCreatedFarmInfo from '@/hooks/portfolio/farm/useCreatedFarmInfo'
import { useEvent } from '@/hooks/useEvent'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import PlusCircleIcon from '@/icons/misc/PlusCircleIcon'
import { useAppStore, useClmmStore, useFarmStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { genCSS2GridTemplateColumns, genCSS3GridTemplateColumns } from '@/theme/detailConfig'
import { WEEK_SECONDS } from '@/utils/date'
import { routeBack, setUrlQuery, useRouteQuery } from '@/utils/routeTools'
import { RAY_TOKEN_INFO } from '@/utils/token'
import { CreateFarmType, LiquidityFarmActionModeType } from '@/features/Liquidity/Decrease/components/type'
import { TxErrorModal } from '../../../components/Modal/TxErrorModal'
import RewardAddItem from './components/AddRewards'
import ReviewDetail from './components/DetailReview'
import SelectPool from './components/SelectPool'
import { TxSuccessModal } from './components/TxSuccessModal'
import { NewRewardInfo } from './type'

type QueryDetail = {
  step?: LiquidityFarmActionModeType
  ammId?: string
  poolType?: CreateFarmType
}

const MODE_TO_STEP = {
  select: 0,
  reward: 1,
  review: 2,
  done: 2
}

/**
 * manage all may change state in this component
 */
export default function CreateFarm() {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()

  // -------- step --------
  const query = useRouteQuery<QueryDetail>()
  const createStandardFarmAct = useFarmStore((s) => s.createFarmAct)
  const createClmmFarmAct = useClmmStore((s) => s.createFarm)
  const operationOwners = useClmmStore((s) => s.operationOwners)
  const publicKey = useAppStore((s) => s.publicKey)
  const isOp = publicKey && operationOwners.map((r) => r.toBase58()).includes(publicKey.toBase58())
  const [farmId, setFarmId] = useState('')
  const [currentStep, setCurrentStep] = useState<LiquidityFarmActionModeType>(query.step ?? 'select')
  const currentStepIndex = useMemo(() => MODE_TO_STEP[currentStep], [currentStep])
  const stepsRef = useRef<StepsRef>(null)
  const defaultPoolRef = useRef<string | undefined>(query.ammId)
  const owner = useAppStore((s) => s.publicKey)
  const maxRewardTokenCount = isOp ? 3 : 2

  // -------- step 1 --------
  const [selectedPoolType, setSelectedPoolType] = useState<CreateFarmType>('Concentrated')
  const [selectedPool, setSelectedPool] = useState<ApiV3PoolInfoItem | undefined>()

  // -------- step 2 --------
  const [rewardInfos, setRewardInfos] = useState<NewRewardInfo[]>([{ id: uuidv4(), token: RAY_TOKEN_INFO, isValid: false }])

  const { isOpen: isSending, onOpen: onSending, onClose: offSending } = useDisclosure()
  // -------- tx dialog --------
  const { isOpen: isSuccessModalOpen, onOpen: onOpenSuccessModal, onClose: onCloseSuccessModal } = useDisclosure()
  const { isOpen: isErrorModalOpen, onOpen: onOpenErrorModal, onClose: onCloseErrorModal } = useDisclosure()

  // data fetching
  const { data: poolList } = useCreatedFarmInfo({
    owner
  })
  const { formattedData } = useFetchPoolById({
    idList: [defaultPoolRef.current, ...poolList.clmm.map((c) => c.id)]
  })
  const defaultPool = formattedData?.find((p) => p.id === defaultPoolRef.current)
  const allCreatedPools = useMemo(
    () => formattedData?.filter((p) => p.id !== defaultPoolRef.current) || [],
    [formattedData]
  ) as ApiV3PoolInfoConcentratedItem[]

  const createdPools = allCreatedPools.filter((p) => p.rewardDefaultInfos.length === 0)

  const handleCreateFarm = useEvent(() => {
    onSending()
    if (selectedPoolType === 'Standard') {
      return createStandardFarmAct({
        poolInfo: selectedPool as ApiV3PoolInfoStandardItem,
        rewardInfos: rewardInfos.map((r) => ({
          programId: new PublicKey(r.token!.programId),
          mint: new PublicKey(r.token!.address),
          perSecond: new Decimal(r.amount!)
            .mul(10 ** r.token!.decimals)
            .div(new Decimal(r.farmEnd!).sub(new Decimal(Math.max(r.farmStart!, Date.now()))).div(1000))
            .toFixed(0, Decimal.ROUND_DOWN),
          openTime: Number(new Decimal(Math.max(r.farmStart!, Date.now())).div(1000).toFixed(0)),
          endTime: Number(new Decimal(r.farmEnd!).div(1000).toFixed(0)),
          rewardType: 'Standard SPL'
        })),
        onSent: (props) => {
          offSending()
          setFarmId(props?.farmId.toString() || '')
        },
        onConfirmed: () => {
          onOpenSuccessModal()
        },
        onError: () => {
          offSending()
          onOpenErrorModal()
        }
      })
    }

    createClmmFarmAct({
      poolInfo: selectedPool as ApiV3PoolInfoConcentratedItem,
      rewardInfos: rewardInfos.map((r) => ({
        mint: r.token!,
        perSecond: new Decimal(r.amount!)
          .mul(10 ** r.token!.decimals)
          .div(new Decimal(r.farmEnd!).sub(new Decimal(Math.max(r.farmStart!, Date.now()))).div(1000))
          .toDecimalPlaces(0, Decimal.ROUND_DOWN),
        openTime: Math.floor(new Decimal(Math.max(r.farmStart!, Date.now())).div(1000).toNumber()),
        endTime: Math.floor(new Decimal(r.farmEnd!).div(1000).toNumber())
      })),
      onSent: () => {
        offSending()
        setFarmId((selectedPool as ApiV3PoolInfoConcentratedItem).id)
      },
      onConfirmed: () => {
        onOpenSuccessModal()
      },
      onError: () => {
        onOpenErrorModal()
        offSending()
      }
    })
  })

  /** step method */
  const routeToStepReward = () => {
    setCurrentStep('reward')
    setUrlQuery<QueryDetail>({
      step: 'reward',
      ammId: selectedPool?.id,
      poolType: selectedPoolType
    })
  }

  /** step method */
  const routeToStepReview = () => {
    setCurrentStep('review')
    setUrlQuery<QueryDetail>({ step: 'review' })
  }
  const routeToStepSelect = () => {
    setCurrentStep('select')
    setUrlQuery<QueryDetail>({ step: 'select' })
  }

  const onRewardInfoChange = (rewardInfo: Partial<NewRewardInfo>, index: number) => {
    setRewardInfos((prev) => {
      const newRewardInfos = [...prev]
      newRewardInfos[index] = { ...newRewardInfos[index], ...rewardInfo }
      return newRewardInfos
    })
  }
  const addANewRewardInfo = () => {
    setRewardInfos((prev) => {
      const newRewardInfos = [...prev]
      newRewardInfos.push({ id: uuidv4(), isValid: false })
      return newRewardInfos
    })
  }
  const deleteAnExistReward = (index: number) => {
    setRewardInfos((prev) => {
      const newRewardInfos = [...prev]
      newRewardInfos.splice(index, 1)
      return newRewardInfos
    })
  }

  // step guard, prevent user to manually change step by url
  useEffect(() => {
    const { step: mode, ammId } = query
    let activeMode = mode && ammId ? mode : 'select'
    const isRewardValid = !rewardInfos.some((r) => !r.isValid)
    if (activeMode === 'review' && (!rewardInfos.length || !isRewardValid)) activeMode = 'reward'
    setCurrentStep(activeMode)
    stepsRef.current?.setActiveStep(MODE_TO_STEP[activeMode] || 0)
  }, [query, rewardInfos.length])

  useEffect(() => {
    if (defaultPool) {
      setSelectedPool(defaultPool)
      setSelectedPoolType(defaultPool.type)
    }
  }, [defaultPool?.id])

  if (currentStep === 'done') return <div>{t('done')}</div>

  return (
    <Grid
      gridTemplate={[
        `
          "back  " auto
          "step  " auto
          "panel " auto
          "note  " minmax(80px, 1fr) / 1fr
        `,
        `
          "back word " auto
          "step panel" auto
          "note panel" 1fr / ${genCSS2GridTemplateColumns({
            rightLeft: 344,
            center: currentStep === 'select' ? 520 : currentStep === 'reward' ? 598 : 735
          })}
        `,
        `
          "back word  ." auto
          "step panel ." auto
          "note panel ." 1fr / ${genCSS3GridTemplateColumns({
            rightLeft: 344,
            center: currentStep === 'select' ? 520 : currentStep === 'reward' ? 598 : 735
          })}
        `
      ]}
      columnGap={[
        0,
        currentStep === 'select'
          ? 'clamp(120px / 5, 8.33vw, 120px * 3)' // 8.33vw = calc(120px / 1440px * 100vw)
          : currentStep === 'reward'
          ? 'clamp(92px / 5, 6.39vw, 92px * 3)' // 6.39vw = calc(92px / 1440px * 100vw)
          : 'clamp(56px / 5, 3.89vw, 56px * 3)' // 3.89vw = calc(56px / 1440px * 100vw)
      ]}
      rowGap={[4, 4]}
      mt={[2, 8]}
    >
      <GridItem area="back">
        <HStack
          cursor="pointer"
          onClick={() => {
            routeBack()
          }}
          color={colors.textTertiary}
          fontWeight="500"
          fontSize={['md', 'xl']}
        >
          <ChevronLeftIcon />
          <Text>{t('Back')}</Text>
        </HStack>
      </GridItem>

      <GridItem area="step">
        <Steps
          currentIndex={currentStepIndex}
          variant={isMobile ? 'row-title' : 'column-list'}
          steps={[
            { title: t('Step 1'), description: t('Select Pool') },
            { title: t('Step 2'), description: t('Add Rewards') },
            { title: t('Step 3'), description: t('Review Farm Detail') }
          ]}
          onChange={(idx) => {
            if (idx === 0 && idx !== currentStepIndex) routeToStepSelect()
            if (idx === 1 && idx !== currentStepIndex) routeToStepReward()
            if (idx === 2 && idx !== currentStepIndex) routeToStepReview()
          }}
          ref={stepsRef}
        />
      </GridItem>

      <GridItem area="note">
        <Box>
          <SubPageNote
            title={t('Please Note')}
            description={
              <Text fontSize="sm" color={colors.textPrimary}>
                {t('This tool is for advanced users. For detailed instructions, read the guide for CLMM or Standard pools.')}
              </Text>
            }
          />
        </Box>
      </GridItem>

      <GridItem area="word" display={['none', 'unset']}>
        {/* main header */}
        {currentStep === 'select' ? (
          <Box>
            <Text w="fit-content" color={colors.textSecondary} fontWeight="600" fontSize="xl">
              {t('First, select a pool for farm rewards')}
            </Text>
          </Box>
        ) : currentStep === 'reward' ? (
          <Flex justify="space-between" w="full" align="center">
            <Text w="fit-content" color={colors.textSecondary} fontWeight="600" fontSize="xl">
              {t('Next, enter rewards for the farm')}
            </Text>
            <HStack
              align="center"
              onClick={addANewRewardInfo}
              color={colors.secondary}
              sx={
                (selectedPoolType === 'Concentrated' && rewardInfos.length >= maxRewardTokenCount) ||
                (selectedPoolType === 'Standard' && rewardInfos.length >= 5)
                  ? { opacity: 0.5, pointerEvents: 'none' }
                  : { cursor: 'pointer' }
              }
            >
              <PlusCircleIcon width="14px" height="14px" color={colors.primary60} />
              <Text color={colors.primary60} fontSize="16px" fontWeight="500">
                {t('Add another')}
              </Text>
            </HStack>
          </Flex>
        ) : (
          <Box>
            <Text w="fit-content" color={colors.textSecondary} fontWeight="600" fontSize="xl">
              {t('Review Farm Detail')}
            </Text>
          </Box>
        )}
      </GridItem>

      <GridItem area="panel">
        <Box flexShrink={0} mr={currentStep === 'review' ? 4 : 0}>
          {currentStep === 'select' ? (
            <SelectPool
              selectedPoolType={selectedPoolType}
              onSelectPoolType={setSelectedPoolType}
              selectedPool={selectedPool?.type === selectedPoolType ? selectedPool : undefined}
              onSelectPool={setSelectedPool}
              createdClmmPools={createdPools}
              onClickContinue={() => {
                stepsRef.current?.goToNext()
                routeToStepReward()
              }}
            />
          ) : currentStep === 'reward' ? (
            <RewardAddItem
              maxRewardCount={selectedPoolType === 'Concentrated' ? maxRewardTokenCount : 5}
              rewardInfos={rewardInfos}
              onRewardInfoChange={onRewardInfoChange}
              onAddAnotherReward={addANewRewardInfo}
              onDeleteReward={deleteAnExistReward}
              onClickBackButton={() => {
                stepsRef.current?.goToPrevious()
                routeToStepSelect()
              }}
              onClickNextStepButton={() => {
                stepsRef.current?.goToNext()
                routeToStepReview()
              }}
            />
          ) : (
            <>
              <ReviewDetail
                rewardInfos={rewardInfos}
                poolInfo={selectedPool}
                isSending={isSending}
                onClickBackButton={() => {
                  stepsRef.current?.goToPrevious()
                  routeToStepReward()
                }}
                onClickCreateFarmButton={handleCreateFarm}
                onJumpToStepSelect={() => {
                  stepsRef.current?.goTo(0)
                  routeToStepSelect()
                }}
                onJumpToStepReward={() => {
                  stepsRef.current?.goTo(1)
                  routeToStepReward()
                }}
              />
              <TxSuccessModal farmId={farmId} isOpen={isSuccessModalOpen} onClose={onCloseSuccessModal} />
              <TxErrorModal
                description="Failed to create farm. Please try again later."
                isOpen={isErrorModalOpen}
                onClose={onCloseErrorModal}
              />
            </>
          )}
        </Box>
      </GridItem>
    </Grid>
  )
}
