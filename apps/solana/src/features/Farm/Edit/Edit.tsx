import { Box, Flex, Grid, GridItem, HStack, Heading, Link, Skeleton, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import {
  ApiV3PoolInfoConcentratedItem,
  FARM_PROGRAM_ID_V6,
  FarmStateV6,
  FormatFarmInfoOutV6,
  TokenInfo,
  solToWSol,
  solToWSolToken
} from '@pancakeswap/solana-core-sdk'
import { PublicKey } from '@solana/web3.js'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { shallow } from 'zustand/shallow'

import { BN } from 'bn.js'
import Decimal from 'decimal.js'
import Button from '@/components/Button'
import useFetchFarmInfoById from '@/hooks/farm/useFetchFarmInfoById'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import { refreshPoolCache } from '@/hooks/pool/useFetchPoolList'
import { refreshCreatedFarm } from '@/hooks/portfolio/farm/useCreatedFarmInfo'
import { useEvent } from '@/hooks/useEvent'
import PlusCircleIcon from '@/icons/misc/PlusCircleIcon'
import { useAppStore, useClmmStore, useFarmStore } from '@/store'
import { colors } from '@/theme/cssVariables'

import SubPageNote from '@/components/SubPageNote'
import useFetchFarmInfoByRpc from '@/hooks/farm/useFetchFarmInfoByRpc'
import useFetchRpcClmmInfo from '@/hooks/pool/clmm/useFetchRpcClmmInfo'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { genCSS2GridTemplateColumns, genCSS3GridTemplateColumns } from '@/theme/detailConfig'
import { TxCallbackProps } from '@/types/tx'
import { routeBack, routeToPage } from '@/utils/routeTools'
import { getClmmKeysFromPoolInfo } from '@/utils/getPoolKeysFromPoolInfo'
import AddAnotherRewardDialog from './components/AddAnotherRewardDialog'
import FarmInfoItem from './components/FarmInfoItem'
import ExistFarmingRewards from './components/FarmingRewards'
import NewRewards from './components/NewRewards'
import { EditReward, farmV6RewardToEditReward, poolRewardToEditReward } from './util'

interface QueryParams {
  farmId?: string
  clmmId?: string
}

const FARM_REFRESH_INTERVAL = 60 * 1000 * 2

export default function FarmEdit() {
  const { t } = useTranslation()
  const { query } = useRouter()
  const { farmId, clmmId } = (query || {}) as QueryParams

  const [remainRewardsCount, setRemainRewardsCount] = useState(0)

  const editFarmRewardsAct = useFarmStore((s) => s.editFarmRewardsAct)
  const withdrawCreatorFarmRewardAct = useFarmStore((s) => s.withdrawCreatorFarmRewardAct)
  const [rewardWhiteListMints, setRewardsAct, collectRewardAct] = useClmmStore(
    (s) => [s.rewardWhiteListMints, s.setRewardsAct, s.collectRewardAct],
    shallow
  )
  const [owner, chainTimeOffset] = useAppStore((s) => [s.publicKey, s.chainTimeOffset], shallow)
  const { isOpen: isSending, onOpen: onSending, onClose: offSending } = useDisclosure()
  const {
    isOpen: isAddAnotherRewardDialogOpen,
    onClose: onCloseAddAnotherRewardDialog,
    onOpen: onOpenAddAnotherRewardDialog
  } = useDisclosure()

  const onlineCurrentDate = Date.now() + chainTimeOffset

  const { formattedData, isLoading: isFarmLoading } = useFetchFarmInfoById<FormatFarmInfoOutV6>({
    idList: [farmId],
    refreshInterval: FARM_REFRESH_INTERVAL
  })
  const farmData = formattedData?.[0]
  const { formattedData: formattedPoolData, isLoading: isPoolLoading } = useFetchPoolById<ApiV3PoolInfoConcentratedItem>({
    idList: [clmmId],
    refreshInterval: FARM_REFRESH_INTERVAL
  })
  const clmmData = formattedPoolData?.[0]
  const clmmRewardWhiteListMints = useMemo(
    () => new Set([...rewardWhiteListMints.map((pub) => pub.toBase58()), clmmData?.mintA.address, clmmData?.mintB.address]),
    [rewardWhiteListMints, clmmData?.id, clmmData?.mintA.address, clmmData?.mintB.address]
  )

  const { data: rpcFarm, farmMutate } = useFetchFarmInfoByRpc({
    shouldFetch: !!farmData && farmData.programId === FARM_PROGRAM_ID_V6.toBase58(),
    farmInfo: farmData
      ? {
          programId: farmData.programId,
          id: farmData.id
        }
      : undefined
  })

  const farmV6OwnerRemainingRewards =
    owner && rpcFarm && (rpcFarm as FarmStateV6)?.creator.equals(owner)
      ? ((rpcFarm?.rewardInfos || []) as FarmStateV6['rewardInfos'])
          .filter((r) => !r.rewardEndTime.isZero() && r.rewardEndTime.toNumber() * 1000 < onlineCurrentDate)
          .filter((r) => r.totalReward.sub(r.totalRewardEmissioned).gt(new BN(0)))
          .map((r) => ({
            hasRemaining: true,
            mint: r.rewardMint.toBase58(),
            remaining: r.totalReward.sub(r.totalRewardEmissioned).toString()
          }))
      : []

  const {
    ownerRemainingRewards,
    data: rpcPoolInfo,
    mutate: mutateClmmInfo
  } = useFetchRpcClmmInfo({
    shouldFetch: !!clmmData,
    id: clmmId,
    apiPoolInfo: clmmData
  })

  const isLoading = isFarmLoading || isPoolLoading

  const hasData = (farmId && !!farmData) || (clmmId && clmmData)

  const isValidData = farmData ? farmData.version === 6 : clmmData ? clmmData.type === 'Concentrated' : false

  const operationOwners = useClmmStore((s) => s.operationOwners)
  const publicKey = useAppStore((s) => s.publicKey)
  const isOp = publicKey && operationOwners.map((r) => r.toBase58()).includes(publicKey.toBase58())
  const maxRewardCount = isOp ? 3 : 2

  const availableRewardCount = farmData ? 5 : clmmData ? maxRewardCount : 0

  const [token1, token2] = [farmData?.symbolMints[0] || clmmData?.mintA, farmData?.symbolMints[1] || clmmData?.mintB]
  const [name = '-', tvl = '0', apr = ''] = [
    farmData?.farmName || clmmData?.poolName,
    farmData?.tvl || clmmData?.tvl,
    farmData?.apr || clmmData?.day.apr
  ]

  const id = farmData?.id || clmmData?.id

  const farmTVL = farmData?.tvl || clmmData?.tvl

  const rewardData = farmData
    ? farmData.formattedRewardInfos.map(farmV6RewardToEditReward)
    : clmmData
    ? clmmData.formattedRewardInfos.map(poolRewardToEditReward)
    : []

  const [flag, setFlag] = useState<number>(0)
  const editedRewardRef = useRef({ getRewards: () => [] as EditReward[] })
  const newRewardRef = useRef({ getRewards: () => [] as EditReward[], addNewReward: (_: EditReward) => {} })

  const hasRewardsData = editedRewardRef.current?.getRewards().length || newRewardRef.current?.getRewards().length

  useEffect(() => {
    setRemainRewardsCount(availableRewardCount - rewardData.length)
  }, [availableRewardCount, rewardData.length])

  const handleUpdate = useEvent(() => setFlag(Date.now()))

  const handleSubmitEdit = useEvent(() => {
    onSending()
    if (clmmData) {
      const rewardInfos = editedRewardRef.current.getRewards().map((r) => ({
        mint: solToWSolToken({
          ...r.mint,
          programId: r.mint.address === clmmData.mintA?.address ? clmmData.mintA.programId : r.mint.programId
        }),
        openTime: Math.floor(Math.max(r.openTime, onlineCurrentDate) / 1000),
        endTime: Math.floor(r.endTime / 1000),
        perSecond: new Decimal(r.total)
          .mul(10 ** r.mint.decimals)
          .div(new Decimal(r.endTime).sub(Math.max(r.openTime, onlineCurrentDate)).div(1000))
          .toDecimalPlaces(0, Decimal.ROUND_DOWN)
      }))
      return setRewardsAct({
        poolInfo: clmmData,
        poolKeys: getClmmKeysFromPoolInfo(clmmData),
        rewardInfos,
        newRewardInfos: newRewardRef.current.getRewards().map((r) => ({
          mint: solToWSolToken(r.mint),
          openTime: Math.ceil(r.openTime / 1000),
          endTime: Math.floor(r.endTime / 1000),
          perSecond: new Decimal(r.total)
            .mul(10 ** r.mint.decimals)
            .div(new Decimal(r.endTime).sub(r.openTime).div(1000))
            .toDecimalPlaces(0, Decimal.ROUND_DOWN)
        })),
        onFinally: offSending,
        onConfirmed: () => {
          refreshCreatedFarm()
          refreshPoolCache()
          routeToPage('pools')
        }
      })
    }
    editFarmRewardsAct({
      farmInfo: farmData!,
      editedRewards: editedRewardRef.current.getRewards().map((r) => ({
        programId: new PublicKey(r.mint.programId),
        mint: new PublicKey(r.mint.address),
        openTime: Math.floor(Math.max(r.openTime, onlineCurrentDate + 30000) / 1000),
        endTime: Math.floor(r.endTime / 1000),
        perSecond: new Decimal(r.total)
          .mul(10 ** r.mint.decimals)
          .div(new Decimal(r.endTime).sub(Math.max(r.openTime, onlineCurrentDate)).div(1000))
          .toFixed(0, Decimal.ROUND_DOWN),
        rewardType: farmData!.rewardInfos.find((oldR) => r.mint.address === oldR.mint.address)!.type
      })),
      newRewards: newRewardRef.current.getRewards().map((r) => ({
        programId: new PublicKey(r.mint.programId),
        mint: new PublicKey(r.mint.address),
        openTime: Math.floor(r.openTime / 1000),
        endTime: Math.floor(r.endTime / 1000),
        perSecond: new Decimal(r.total)
          .mul(10 ** r.mint.decimals)
          .div(new Decimal(r.endTime).sub(Math.max(r.openTime, onlineCurrentDate)).div(1000))
          .toFixed(0, Decimal.ROUND_DOWN),
        rewardType: 'Standard SPL'
      })),
      onFinally: offSending,
      onConfirmed: () => {
        refreshCreatedFarm()
        refreshPoolCache()
        routeToPage('portfolio')
      }
    })
  })

  const handleCheckRemainRewardsCount = useEvent(() => {
    setRemainRewardsCount(availableRewardCount - rewardData.length - newRewardRef.current.getRewards().length)
  })

  const handleAddNewReward = useEvent((newReward: EditReward) => {
    newRewardRef.current.addNewReward(newReward)
    handleCheckRemainRewardsCount()
  })

  const tokenFilterFn = useEvent((token: TokenInfo, escapeExistMint?: string) => {
    let isClmmRewardValid = true
    const existedTokens = new Set([
      ...rewardData.map((r) => r.mint.address),
      ...newRewardRef.current.getRewards().map((r) => solToWSol(r.mint.address).toString())
    ])
    if (escapeExistMint) existedTokens.delete(escapeExistMint)
    if (
      clmmData &&
      remainRewardsCount + (escapeExistMint ? 1 : 0) <= 1 &&
      !Array.from(existedTokens).some((pub) => clmmRewardWhiteListMints.has(pub))
    ) {
      isClmmRewardValid = clmmRewardWhiteListMints.has(solToWSol(token.address).toString())
    }

    return !existedTokens.has(solToWSol(token.address).toString()) && isClmmRewardValid
  })

  const handleClaimRemainingReward = useEvent(async ({ mint, ...rest }: { mint: string } & TxCallbackProps) => {
    if (farmData)
      withdrawCreatorFarmRewardAct({
        farmInfo: farmData as any,
        withdrawMint: new PublicKey(mint),
        ...rest,
        onConfirmed: () => {
          rest.onConfirmed?.()
          farmMutate()
        }
      })
    else if (clmmData)
      collectRewardAct({
        poolInfo: clmmData,
        rewardMint: new PublicKey(mint),
        ...rest,
        onConfirmed: () => {
          rest.onConfirmed?.()
          mutateClmmInfo()
        }
      })
  })

  if (!isLoading) {
    if (!hasData) return <Box mt="24px">{t('Farm not found')}</Box>
    if (!isValidData) return <Box mt="24px">{t('Farm is not editable')}</Box>
  }

  return (
    <Grid
      gridTemplate={[
        `
            "back          " auto
            "word          " auto
            "pool          " auto
            "rewards       " auto
            "action-buttons" auto
            "note" auto /  1fr
          `,
        `
            "back    word           " auto
            "note    pool           " auto
            "note    rewards        " auto
            "note    action-buttons " 1fr / ${genCSS2GridTemplateColumns({ rightLeft: 344, center: 468 })}
          `,
        `
            "back    word           ." auto
            "note    pool           " auto
            "note    rewards        ." auto
            "note    action-buttons ." 1fr / ${genCSS3GridTemplateColumns({ rightLeft: 344, center: 468 })}
          `
      ]}
      columnGap={[0, 24]}
      rowGap={[4, 4]}
      mt={[2, 8]}
      mx={[0, 0, 0, 16]}
      pb="48px"
    >
      <GridItem area="back">
        <Flex mb={[0, 4]}>
          <HStack cursor="pointer" onClick={routeBack} color={colors.primary60} fontWeight="500" fontSize={['md', 'lg']}>
            <ChevronLeftIcon />
            <Text>{t('Back')}</Text>
          </HStack>
        </Flex>
      </GridItem>

      <GridItem area="note">
        <Box w={['unset', 'clamp(300px, 100%, 500px)']}>
          <SubPageNote
            title={t('How to add more rewards?')}
            description={
              <VStack gap={2}>
                <Text>{t('1. Rewards allocated to farms cannot be withdrawn after farming starts.')}</Text>
                <Text>
                  {t(
                    '2. If you want to increase the reward rate, additional rewards can be added while a farm is still running. The period must be extended by at least 7 days.'
                  )}
                </Text>
                <Text>
                  {t(
                    '3. If you want to increase or decrease the emissions rate, you must wait until the current rewards period ends before starting a new period and then adjusting the rewards amount and emissions rate.'
                  )}
                </Text>
              </VStack>
            }
          />
        </Box>
      </GridItem>

      <GridItem area="word">
        <Flex flexDirection="column" gap="2">
          <HStack gap={4}>
            <Text fontWeight="600" color={colors.textSecondary} fontSize="20px">
              {t('Edit Farm')}
            </Text>
            {id && (
              <Text color={colors.textSubtle} fontSize="sm">
                {t('Farm id')}: {id?.slice(0, 6)}...{id.slice(-6)}
              </Text>
            )}
          </HStack>
          <Text fontSize="sm" color={colors.textSubtle}>
            {t('Before creating a farm, make sure to check the')}{' '}
            <Link
              href="https://docs.pancakeswap.finance/" // TODO: Add docs link for farms
              isExternal
              fontWeight="600"
              color={colors.primary}
            >
              {t('detailed guide')}
            </Link>
          </Text>
        </Flex>
      </GridItem>

      <GridItem area="pool">
        <VStack align="stretch">
          <Text fontWeight="600" color={colors.textSubtle} fontSize="xl">
            {t('Pool')}
          </Text>
          {isLoading ? (
            <Skeleton height="60px" />
          ) : (
            <FarmInfoItem name={name} token1={token1!} token2={token2!} apr={apr} tvl={tvl} feeRate={clmmData?.feeRate} />
          )}
        </VStack>
      </GridItem>

      <GridItem mt="6" area="rewards">
        <VStack align="stretch">
          <HStack justifyContent="space-between">
            <Text fontWeight="600" color={colors.textSubtle} fontSize="xl">
              {t('Farm rewards')}
            </Text>
            <HStack
              align="center"
              opacity={remainRewardsCount ? 1 : 0.5}
              onClick={remainRewardsCount ? onOpenAddAnotherRewardDialog : undefined}
              cursor={remainRewardsCount ? 'pointer' : 'default'}
            >
              <PlusCircleIcon width="14px" height="14px" color={colors.primary60} />
              <Text color={colors.primary60} fontSize="16px" fontWeight="500">
                {t('Add another')}
              </Text>
            </HStack>
          </HStack>
          {isLoading ? (
            <Skeleton height="60px" />
          ) : (
            <>
              <ExistFarmingRewards
                actionRef={editedRewardRef}
                onUpdate={handleUpdate}
                rewards={rewardData}
                ownerRemainingRewards={rpcFarm ? farmV6OwnerRemainingRewards : ownerRemainingRewards}
                farmTVL={farmTVL}
                isEcosystem={!!farmData}
                onClaimRemaining={handleClaimRemainingReward}
              />
              <NewRewards
                actionRef={newRewardRef}
                farmTVL={farmTVL}
                isEcosystem={!!farmData}
                onCheckRemaining={handleCheckRemainRewardsCount}
                tokenFilterFn={tokenFilterFn}
              />
            </>
          )}
        </VStack>
      </GridItem>

      <GridItem area="action-buttons">
        <Flex justifyContent="center" mt="15px" mb="12px" gap="4">
          <Button
            key={flag}
            mt="15px"
            width="100%"
            minWidth="16em"
            maxWidth="unset"
            borderBottom="2px solid rgb(0, 0, 0, 0.2)"
            isLoading={isSending}
            onClick={handleSubmitEdit}
            isDisabled={!hasRewardsData}
          >
            {t('Confirm')}
          </Button>
        </Flex>
      </GridItem>

      {isAddAnotherRewardDialogOpen && (
        <AddAnotherRewardDialog isOpen tokenFilterFn={tokenFilterFn} onSave={handleAddNewReward} onClose={onCloseAddAnotherRewardDialog} />
      )}
    </Grid>
  )
}
