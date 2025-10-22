import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, HStack, Link, Spacer, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { Checkbox } from '@pancakeswap/uikit'
import { ApiV3PoolInfoItem, ApiV3PoolInfoConcentratedItem, PoolFetchType } from '@pancakeswap/solana-core-sdk'
import NextLink from 'next/link'
import Button from '@/components/Button'
import PanelCard from '@/components/PanelCard'
import PoolSelectDialog from '@/features/Farm/Create/components/PoolSelectDialog'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { useEvent } from '@/hooks/useEvent'
import SearchIcon from '@/icons/misc/SearchIcon'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getPoolName } from '@/features/Pools/util'

import { Desktop } from '@/components/MobileDesktop'
import { CreateFarmType } from '@/features/Liquidity/Decrease/components/type'
// import { QuestionToolTip } from '@/components/QuestionToolTip'

type SelectPoolProps = {
  selectedPoolType: CreateFarmType
  createdClmmPools: ApiV3PoolInfoConcentratedItem[]

  selectedPool?: ApiV3PoolInfoItem
  onSelectPool: (pool?: ApiV3PoolInfoItem) => void

  onClickContinue?: () => void
  onSelectPoolType?: (poolType: CreateFarmType) => void
}

export default function SelectPool(props: SelectPoolProps) {
  const { t } = useTranslation()

  const onDeleteStandardValue = useEvent(() => {
    props.onSelectPool(undefined)
  })

  return (
    <PanelCard px={[4, 6]} py={[4, 6]}>
      <Desktop>
        <Text mb={6} fontWeight="600" fontSize="lg" color={colors.secondary}>
          {t('Select Pool')}
        </Text>
      </Desktop>

      <HStack flexDirection={['column', 'row']} align={['stretch', 'center']} mb={6} spacing={3}>
        <PoolTypeTabItem
          isActive={props.selectedPoolType === 'Concentrated'}
          name={t('Concentrated Liquidity')}
          onSelect={() => props.onSelectPoolType?.('Concentrated')}
        />
        <PoolTypeTabItem
          isActive={props.selectedPoolType === 'Standard'}
          name={t('Standard AMM')}
          onSelect={() => props.onSelectPoolType?.('Standard')}
        />
      </HStack>

      <Box mb={6}>
        {props.selectedPoolType === 'Concentrated' ? (
          <SelectPoolConcentratedContent
            createdClmmPools={props.createdClmmPools}
            selectedPool={props.selectedPool}
            onSelectConcentratedValue={props.onSelectPool}
          />
        ) : (
          <SelectPoolStandardContent
            selectedPool={props.selectedPool}
            onSelectStandardValue={props.onSelectPool}
            onDeleteStandardValue={onDeleteStandardValue}
          />
        )}
      </Box>

      <Button
        isDisabled={!props.selectedPool}
        onClick={() => props.onClickContinue?.()}
        size="md"
        width="full"
        variant="solid"
        rounded="full"
        borderBottom={props.selectedPool ? '2px solid rgba(0, 0, 0, 0.2)' : 'none'}
        transition="all 0.4s ease"
      >
        {t('Continue')}
      </Button>
    </PanelCard>
  )
}

function PoolTypeTabItem({ name, isActive, onSelect: onClickSelf }: { name: string; isActive?: boolean; onSelect?: () => void }) {
  return (
    <HStack
      flexGrow={1}
      justify="space-between"
      color={isActive ? colors.textPrimary : colors.textDisabled}
      bg={colors.inputBg}
      borderTop={`1px solid ${isActive ? colors.inputSecondary : colors.inputBg}`}
      borderRight={`1px solid ${isActive ? colors.inputSecondary : colors.inputBg}`}
      borderBottom={`2px solid ${isActive ? colors.inputSecondary : colors.inputBg}`}
      borderLeft={`1px solid ${isActive ? colors.inputSecondary : colors.inputBg}`}
      px={4}
      py={3}
      rounded="16px"
      cursor="pointer"
      position="relative"
      onClick={onClickSelf}
      _hover={{
        bg: isActive ? colors.inputBg : colors.backgroundAlt
      }}
      transition="all 0.2s"
    >
      <Text whiteSpace="nowrap" fontSize="sm" fontWeight="500">
        {name}
      </Text>

      <Box>
        <Checkbox scale="sm" checked={isActive} style={{ pointerEvents: 'none' }} readOnly />
      </Box>
    </HStack>
  )
}

function SelectPoolStandardContent(props: {
  selectedPool: ApiV3PoolInfoItem | undefined
  onSelectStandardValue: (pool: ApiV3PoolInfoItem) => void
  onDeleteStandardValue: () => void
}) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const onSearchClick = useEvent(() => {
    onOpen()
  })
  return (
    <Box>
      <Box mb={4}>
        {props.selectedPool ? (
          <SelectPoolStandardContentSelectedPool pool={props.selectedPool} onDeleteStandardValue={props.onDeleteStandardValue} />
        ) : (
          <Flex
            justify="space-between"
            align="center"
            h="72px"
            bg={colors.backgroundDark}
            border={`1px solid ${colors.cardBorder01}`}
            py={4}
            px={6}
            color={colors.textTertiary}
            borderRadius="16px"
            gap={3}
            onClick={onSearchClick}
            cursor="pointer"
          >
            <>
              <Text color={colors.textTertiary} fontSize="sm" fontWeight="500" cursor="pointer">
                {t('Search for a pair or enter AMM ID')}
              </Text>
              <SearchIcon color={colors.textTertiary} />
            </>
          </Flex>
        )}
      </Box>

      <HStack fontSize="sm" color={colors.textTertiary}>
        <Text>{t("Can't find what you want?")}</Text>
        <Link as={NextLink} href="/liquidity/create-pool">
          <Text cursor="pointer" color={colors.secondary} textDecoration="underline" fontWeight="500">
            {t('Create a new pool')}
          </Text>
        </Link>
      </HStack>
      <PoolSelectDialog poolType={PoolFetchType.Standard} isOpen={isOpen} onSelectValue={props.onSelectStandardValue} onClose={onClose} />
    </Box>
  )
}

function SelectPoolStandardContentSelectedPool({
  pool,
  onDeleteStandardValue
}: {
  pool: ApiV3PoolInfoItem
  onDeleteStandardValue: () => void
}) {
  const { t } = useTranslation()
  const poolName = useMemo(() => `${pool.mintA.symbol}-${pool.mintB.symbol}`, [pool.id])
  return (
    <VStack align="stretch" spacing={3}>
      <HStack
        borderWidth="2px"
        borderStyle="solid"
        borderColor={colors.secondary}
        bg={colors.backgroundDark}
        p={6}
        rounded="16px"
        cursor="pointer"
        _hover={{
          bg: colors.backgroundLight
        }}
        transition="all 0.2s"
      >
        <TokenAvatarPair token1={pool.mintA} token2={pool.mintB} />
        <Text whiteSpace="nowrap" fontSize="xl" fontWeight="600">
          {poolName}
        </Text>
        <Spacer />
        <Box>
          <Text fontSize="sm" color={colors.textTertiary} align="end" fontWeight="500">
            {pool.id.slice(0, 6)}...{pool.id.slice(-6)}
          </Text>
          <Text whiteSpace="nowrap" fontSize="sm" color={colors.textSecondary} align="end">
            TVL: {formatCurrency(pool.tvl, { decimalPlaces: 2 })}
          </Text>
        </Box>
      </HStack>

      <HStack fontSize="sm" justifyContent="flex-end">
        <Text cursor="pointer" color={colors.secondary} textDecoration="underline" fontWeight="500" onClick={onDeleteStandardValue}>
          {t('Reset')}
        </Text>
      </HStack>
    </VStack>
  )
}

function SelectPoolConcentratedContent(props: {
  createdClmmPools: ApiV3PoolInfoConcentratedItem[]
  selectedPool: ApiV3PoolInfoItem | undefined
  onSelectConcentratedValue: (pool: ApiV3PoolInfoItem) => void
}) {
  const { t } = useTranslation()
  return (
    <Box>
      <HStack mb={4} color={colors.textSecondary} fontSize="sm">
        <Text fontSize="lg" fontWeight="600">
          {t('Select from your created pools')}:
        </Text>
        {/* <QuestionToolTip label={t('The farm will be created for the selected pool')} iconProps={{ color: colors.textSecondary }} /> */}
      </HStack>
      <VStack spacing={3} mb={4} align="stretch">
        {props.createdClmmPools.map((pool) => (
          <CreatedPoolClmmItem
            key={pool.id}
            isActive={pool.id === props.selectedPool?.id}
            pool={pool}
            onSelect={props.onSelectConcentratedValue}
          />
        ))}
      </VStack>
      <HStack fontSize="sm" color={colors.textTertiary}>
        <Text>{t("Can't find what you want?")}</Text>
        <Link as={NextLink} href="/clmm/create-pool">
          <Text cursor="pointer" color={colors.secondary} textDecoration="underline" fontWeight="500">
            {t('Create a new pool')}
          </Text>
        </Link>
      </HStack>
    </Box>
  )
}

function CreatedPoolClmmItem({
  pool,
  isActive,
  onSelect
}: {
  pool: ApiV3PoolInfoItem
  isActive?: boolean
  onSelect?(pool: ApiV3PoolInfoItem): void
}) {
  return (
    <HStack
      borderWidth="1px"
      borderStyle="solid"
      borderColor={isActive ? colors.secondary : 'transparent'}
      bg={isActive ? colors.backgroundDark : colors.background}
      py={4}
      px={6}
      rounded="16px"
      cursor="pointer"
      onClick={() => onSelect?.(pool)}
      _hover={{
        bg: isActive ? colors.backgroundLight : colors.inputBg,
        borderColor: isActive ? colors.secondary : colors.cardBorder01
      }}
      transition="all 0.2s"
    >
      <TokenAvatarPair size={['28px', 'md']} token1={pool.mintA} token2={pool.mintB} />
      <Text flex={1} fontSize="lg" fontWeight="600" color={colors.textPrimary}>
        {getPoolName(pool)}
      </Text>
      <Box>
        <Text fontSize={['xs', 'sm']} align="end" fontWeight="500">
          {pool.id.slice(0, 6)}...{pool.id.slice(-6)}
        </Text>
        <Text whiteSpace="nowrap" fontSize={['xs', 'sm']} color={colors.textSubtle} align="end">
          TVL: {formatCurrency(pool.tvl, { decimalPlaces: 2 })}
        </Text>
      </Box>
    </HStack>
  )
}
