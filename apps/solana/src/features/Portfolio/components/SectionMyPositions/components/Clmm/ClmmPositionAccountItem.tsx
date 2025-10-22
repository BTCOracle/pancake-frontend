import { Box, useDisclosure } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { AprKey, timeBasisOptions, FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import AddLiquidityModal from '@/features/Clmm/LiquidityEditModal/AddLiquidityModal'
import RemoveLiquidityModal from '@/features/Clmm/LiquidityEditModal/RemoveLiquidityModal'
import { BreakdownRewardInfo, useClmmRewardInfoFromSimulation } from '@/hooks/pool/clmm/useFetchClmmRewardInfo'
import { PositionWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import { getPositionAprCore } from '@/features/Clmm/utils/calApr'
import useFetchRpcClmmInfo from '@/hooks/pool/clmm/useFetchRpcClmmInfo'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore } from '@/store'
import { useClmmStore } from '@/store/useClmmStore'
import { RpcPoolData } from '@/hooks/pool/clmm/useSubscribeClmmInfo'
import useClmmBalance, { ClmmLockInfo } from '@/hooks/portfolio/clmm/useClmmBalance'
import { logGTMAddPoolLiquidityEvent, logGTMSubPoolLiquidityEvent } from '@/utils/report/curstomGTMEventTracking'
import ClmmPositionAccountItemDetail from './ClmmPositionAccountItemDetail'
import ClmmPositionAccountItemDetailMobileDrawer from './ClmmPositionAccountItemDetailMobileDrawer'
import ClmmPositionAccountItemFace from './ClmmPositionAccountItemFace'

type ClmmPositionAccountItemProps = {
  poolInfo: FormattedPoolInfoConcentratedItem
  position: PositionWithUpdateFn
  baseIn: boolean
  initRpcPoolData?: RpcPoolData
  lockData?: ClmmLockInfo['']['']
  setNoRewardClmmPos: (val: string, isDelete?: boolean) => void
  onSubscribe: () => void
}

const ZERO = new BN(0)
export const openCache = new Map<string, boolean>()
const realTimeRefresh = 15 * 1000

export default function ClmmPositionAccountItem({
  poolInfo,
  position,
  lockData,
  baseIn,
  initRpcPoolData,
  setNoRewardClmmPos,
  onSubscribe
}: ClmmPositionAccountItemProps) {
  const isLock = !!lockData
  const isMobile = useAppStore((s) => s.isMobile)
  const removeLiquidityAct = useClmmStore((s) => s.removeLiquidityAct)
  const harvestLockPositionAct = useClmmStore((s) => s.harvestLockPositionAct)
  const closePositionAct = useClmmStore((s) => s.closePositionAct)
  const { getPriceAndAmount } = useClmmBalance({})

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: !!openCache.get(position.nftMint.toBase58()) })
  const { isOpen: isRemoveOpen, onClose: onRemoveClose, onOpen: onRemoveOpen } = useDisclosure()
  const { isOpen: isAddOpen, onClose: onAddClose, onOpen: onAddOpen } = useDisclosure()
  const { isOpen: isSending, onClose: offSending, onOpen: onSending } = useDisclosure()
  const [timeBasis, setTimeBasis] = useState<AprKey>(timeBasisOptions[0].value)
  const [refreshTag, setRefreshTag] = useState(0)
  const { data: tokenPrices } = useTokenPrice({
    mintList: [poolInfo.mintA.address, poolInfo.mintB.address]
  })

  const rpcData = useFetchRpcClmmInfo({
    shouldFetch: isRemoveOpen || isAddOpen,
    id: poolInfo.id,
    refreshInterval: isSending ? 5 * 60 * 1000 : realTimeRefresh,
    refreshTag
  })

  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)

  const { priceLower, priceUpper } = getPriceAndAmount({ poolInfo, position })
  const inRange = priceLower.price.lt(poolInfo.price) && priceUpper.price.gt(poolInfo.price)
  const aprData = getPositionAprCore({
    poolInfo,
    positionAccount: position,
    poolLiquidity: rpcData?.data?.liquidity || initRpcPoolData?.poolInfo.liquidity || new BN(0),
    tokenPrices,
    timeBasis,
    planType: 'D',
    chainTimeOffsetMs: chainTimeOffset,
    inRange
  })

  const { totalPendingYield, isEmptyReward, allRewardInfos, breakdownRewardInfo, isLoading } = useClmmRewardInfoFromSimulation({
    poolInfo,
    initRpcPoolData,
    position,
    subscribe: false,
    shouldFetch: !isOpen && !isRemoveOpen && !isAddOpen && !isSending,
    tickLowerPrefetchData: position.tickLowerRpcData,
    tickUpperPrefetchData: position.tickUpperRpcData,
    inRange
  })

  useEffect(() => {
    setNoRewardClmmPos(position.nftMint.toBase58(), !isEmptyReward)
  }, [isEmptyReward, setNoRewardClmmPos])

  const handleClosePosition = useEvent(({ onSend, onFinally }: { onSend?: () => void; onFinally?: () => void }) => {
    onSend?.()
    closePositionAct({
      poolInfo,
      position,
      onFinally
    })
  })
  const handleHarvest = useEvent(({ onSend, onFinally }: { onSend?: () => void; onFinally?: () => void }) => {
    onSend?.()
    if (lockData) {
      harvestLockPositionAct({
        lockData,
        poolInfo,
        position,
        needRefresh: true,
        onFinally
      })
      return
    }

    removeLiquidityAct({
      poolInfo,
      position,
      liquidity: ZERO,
      amountMinA: ZERO,
      amountMinB: ZERO,
      harvest: true,
      needRefresh: true,
      onFinally
    })
  })

  const handleRemoveOpen = useEvent(() => {
    logGTMSubPoolLiquidityEvent()
    onRemoveOpen()
    onSubscribe()
    setRefreshTag(Date.now())
  })
  const handleAddOpen = useEvent(() => {
    logGTMAddPoolLiquidityEvent()
    onAddOpen()
    onSubscribe()
    setRefreshTag(Date.now())
  })

  const handleSyncSending = useEvent((isSending: boolean) => {
    isSending ? onSending() : offSending()
  })

  const positionHash = useMemo(() => position.nftMint.toBase58(), [position.nftMint])

  useEffect(() => {
    openCache.set(position.nftMint.toBase58(), isOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, positionHash])

  useEffect(() => {
    position.updateClmmPendingYield({
      nftMint: position.nftMint.toString(),
      pendingYield: totalPendingYield,
      isEmpty: isEmptyReward,
      rewardInfo: allRewardInfos
    })
  }, [totalPendingYield, positionHash, isEmptyReward])

  useEffect(() => {
    return () => {
      position.updateClmmPendingYield({
        nftMint: position.nftMint.toString(),
        pendingYield: new Decimal(0),
        isEmpty: true,
        rewardInfo: []
      })
    }
  }, [])

  return position.tickLower !== undefined && position.tickUpper !== undefined ? (
    <Box>
      <ClmmPositionAccountItemFace
        isViewOpen={isOpen}
        isLock={!!isLock}
        poolInfo={poolInfo}
        poolLiquidity={initRpcPoolData?.poolInfo.liquidity}
        tokenPrices={tokenPrices}
        position={position}
        baseIn={baseIn}
        hasReward={!isEmptyReward}
        onHarvest={handleHarvest}
        onClickCloseButton={handleClosePosition}
        onClickMinusButton={handleRemoveOpen}
        onClickPlusButton={handleAddOpen}
        onClickViewTrigger={onToggle}
      />
      {isMobile ? (
        isOpen ? (
          <ClmmPositionAccountItemDetailMobileDrawer
            hasReward={!isEmptyReward}
            isLock={!!isLock}
            onHarvest={handleHarvest}
            poolInfo={poolInfo}
            position={position}
            aprData={aprData}
            timeBasis={timeBasis}
            onTimeBasisChange={setTimeBasis}
            nftMint={position.nftMint.toString()}
            totalPendingYield={totalPendingYield.toString()}
            baseIn={baseIn}
            isRewardLoading={isLoading}
            rewardInfos={allRewardInfos}
            breakdownRewardInfo={breakdownRewardInfo as BreakdownRewardInfo}
            onClickCloseButton={handleClosePosition}
            onClickMinusButton={handleRemoveOpen}
            onClickPlusButton={handleAddOpen}
            onClickViewTrigger={onToggle}
          />
        ) : null
      ) : (
        <ClmmPositionAccountItemDetail
          isViewOpen={isOpen}
          hasReward={!isEmptyReward}
          onHarvest={handleHarvest}
          poolInfo={poolInfo}
          aprData={aprData}
          timeBasis={timeBasis}
          onTimeBasisChange={setTimeBasis}
          position={position}
          nftMint={position.nftMint.toString()}
          totalPendingYield={totalPendingYield.toString()}
          baseIn={baseIn}
          rewardInfos={allRewardInfos}
          breakdownRewardInfo={breakdownRewardInfo as BreakdownRewardInfo}
          isRewardLoading={isLoading}
        />
      )}
      <RemoveLiquidityModal
        isOpen={isRemoveOpen}
        onClose={onRemoveClose}
        onSyncSending={handleSyncSending}
        poolInfo={rpcData.data ? { ...poolInfo, price: rpcData.data.currentPrice.toNumber() } : poolInfo}
        onRefresh={rpcData.mutate}
        position={position}
        allRewardInfos={allRewardInfos}
      />
      {isAddOpen ? (
        <AddLiquidityModal
          baseIn={baseIn}
          onSyncSending={handleSyncSending}
          isOpen={isAddOpen}
          onClose={onAddClose}
          poolInfo={rpcData.data ? { ...poolInfo, price: rpcData.data.currentPrice.toNumber() } : poolInfo}
          position={position}
          onRefresh={rpcData.mutate}
        />
      ) : null}
    </Box>
  ) : null
}
