import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { ReactNode, useMemo, useState } from 'react'
import Tabs from '@/components/Tabs'
import useFetchPoolChartData from '@/hooks/pool/useFetchPoolChartData'
import { useAppStore } from '@/store'
import { shrinkToValue } from '@/utils/shrinkToValue'

import Chart from './Chart'
import ChartTooltip from './ChartTooltip'
import { availableTimeType, TimeType } from './const'

export type PoolChartCategory = 'liquidity' | 'volume' | 'tvl'

export default function PoolChartModal({
  poolAddress,
  baseMint,
  isOpen,
  onClose,
  renderModalHeader,
  categories
}: {
  poolAddress: string | undefined
  baseMint?: string
  isOpen: boolean
  categories: { label: string; value: PoolChartCategory }[]
  renderModalHeader?: ((utils: { isOpen?: boolean }) => ReactNode) | ReactNode
  onClose?: () => void
}) {
  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose ?? (() => {})}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{shrinkToValue(renderModalHeader, [{ isOpen }])}</ModalHeader>
        <ModalCloseButton />
        <ModalBody py={0}>
          <ChartWindow poolAddress={poolAddress} baseMint={baseMint} categories={categories} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

/** used in mobile  */
export function ChartWindow({
  poolAddress,
  baseMint,
  categories
}: {
  poolAddress?: string
  baseMint?: string
  categories: { label: string; value: PoolChartCategory }[]
}) {
  const isMobile = useAppStore((s) => s.isMobile)
  const [currentCategory, setCurrentCategory] = useState<PoolChartCategory>(categories[0].value)
  const currentCategoryLabel = useMemo(
    () => categories.find((c) => c.value === currentCategory)?.label ?? '',
    [categories, currentCategory]
  )
  const [currentTimeType, setCurrentTimeType] = useState<TimeType>(availableTimeType[0])
  const { data, isLoading, isEmptyResult } = useFetchPoolChartData({
    category: currentCategory,
    poolAddress,
    baseMint,
    timeType: currentTimeType
  })
  if (isMobile && isEmptyResult) return null
  return (
    <Chart<(typeof data)[0]>
      isEmpty={isEmptyResult}
      isActionRunning={isLoading}
      data={data}
      currentCategoryLabel={currentCategoryLabel}
      xKey="time"
      yKey="v"
      renderToolTip={
        <ChartTooltip
          symbol={currentCategory === 'volume' ? '$' : undefined}
          unit={currentCategory === 'volume' ? 'USD' : undefined}
          category={currentCategoryLabel}
        />
      }
      renderTimeTypeTabs={
        <Tabs
          style={{
            pointerEvents: currentCategory === 'volume' ? 'auto' : 'none',
            visibility: currentCategory === 'volume' ? 'visible' : 'hidden'
          }}
          scale={isMobile ? 'xs' : 'sm'}
          variant="subtle"
          items={availableTimeType}
          value={currentTimeType}
          onChange={setCurrentTimeType}
          ml="auto"
        />
      }
      renderTabs={
        <Tabs
          fullWidth
          tabItemSX={isMobile ? {} : { py: '12px', height: '40px' }}
          scale={isMobile ? 'xs' : 'sm'}
          variant="subtle"
          items={categories}
          value={currentCategory}
          onChange={setCurrentCategory}
          my={2}
        />
      }
    />
  )
}
