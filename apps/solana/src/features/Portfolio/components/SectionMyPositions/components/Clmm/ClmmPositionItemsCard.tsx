import { useRouter } from 'next/router'
import { SwapHorizIcon } from '@pancakeswap/uikit'
import { useCallback, useState, useEffect, useMemo, memo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Grid, GridItem, HStack, Tag, Text, Skeleton, useDisclosure } from '@chakra-ui/react'
import Link from 'next/link'
import { PublicKey } from '@solana/web3.js'
import Decimal from 'decimal.js'
import Button from '@/components/Button'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import AddressChip from '@/components/AddressChip'
import Tooltip from '@/components/Tooltip'
import { colors } from '@/theme/cssVariables'
import { PositionWithUpdateFn } from '@/hooks/portfolio/useAllPositionInfo'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useSubscribeClmmInfo, { RpcPoolData } from '@/hooks/pool/clmm/useSubscribeClmmInfo'
import ChevronDoubleDownIcon from '@/icons/misc/ChevronDoubleDownIcon'
import { panelCard } from '@/theme/cssBlocks'
import { useAppStore } from '@/store'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { ClmmLockInfo } from '@/hooks/portfolio/clmm/useClmmBalance'
import { logGTMCreateNewPositionEvent } from '@/utils/report/curstomGTMEventTracking'
import ClmmPositionAccountItem from './ClmmPositionAccountItem'

const LIST_THRESHOLD = 10

function ClmmPositionItemsCardComp({
  poolInfo,
  isLoading,
  initRpcPoolData,
  lockInfo,
  setNoRewardClmmPos,
  ...props
}: {
  poolId: string | PublicKey
  isLoading: boolean
  positions: PositionWithUpdateFn[]
  lockInfo?: ClmmLockInfo['']
  poolInfo?: FormattedPoolInfoConcentratedItem
  initRpcPoolData?: RpcPoolData
  setNoRewardClmmPos: (val: string, isDelete?: boolean) => void
}) {
  const { t } = useTranslation()
  const isMobile = useAppStore((s) => s.isMobile)
  const { isOpen: baseIn, onToggle } = useDisclosure({ defaultIsOpen: true })
  const { isOpen: isSubscribe, onOpen: onSubscribe } = useDisclosure()
  const data = useSubscribeClmmInfo({ poolInfo, subscribe: isSubscribe || false })
  const { positions: totalPositions } = props
  const [positions, setPositions] = useState<PositionWithUpdateFn[]>([])
  const [pageCurrent, setPageCurrent] = useState(2)
  const pageTotal = Math.ceil(totalPositions.length / LIST_THRESHOLD)

  const rpcData = initRpcPoolData || data
  const router = useRouter()

  const handleCreatePositionBtnClick = useCallback(() => {
    logGTMCreateNewPositionEvent()
    if (!poolInfo) {
      return
    }
    router.push(`/clmm/create-position?pool_id=${poolInfo.id}`)
  }, [poolInfo, router])

  useEffect(() => {
    const currentIndex = pageCurrent * LIST_THRESHOLD
    const positions = totalPositions.length > currentIndex ? totalPositions.slice(0, currentIndex) : totalPositions
    setPositions(positions)
  }, [totalPositions, pageCurrent])

  const loadMore = useCallback(() => setPageCurrent((s) => (s < pageTotal ? s + 1 : s)), [pageTotal])

  useEffect(() => {
    if (poolInfo && rpcData.currentPrice) {
      // eslint-disable-next-line no-param-reassign
      poolInfo.price = rpcData.currentPrice
    }
  }, [poolInfo, rpcData.currentPrice])

  const [hasLockedLiquidity, lockedPositions] = useMemo(
    () => [!!lockInfo, lockInfo ? positions.filter((p) => !!lockInfo[p.nftMint.toBase58()]) : []],
    [lockInfo, positions]
  )

  if (!poolInfo) {
    return isLoading ? <Skeleton w="full" height="140px" rounded="lg" /> : null
  }

  return (
    <Grid
      {...panelCard}
      gridTemplate={[
        `
        "face " auto
        "price " auto
        "items " auto
        "action" auto / 1fr
      `,
        `
        "face price action " auto
        "items items items  " auto / 3fr 3fr 1fr
      `
      ]}
      py={[4, 3]}
      px={[3, 6]}
      mb={4}
      gap={[2, 4]}
      borderRadius="3xl"
      alignItems="center"
    >
      <GridItem area="face" justifySelf={['stretch', 'left']}>
        <Flex gap={2} justify="space-between" alignItems="center">
          <Tooltip
            label={
              <Box py={0.5}>
                <AddressChip address={poolInfo.id} renderLabel={`${t('Pool id')}:`} mb="2" textProps={{ fontSize: 'xs' }} />
                <AddressChip
                  address={poolInfo.mintA.address}
                  renderLabel={<TokenAvatar token={poolInfo.mintA} size="xs" />}
                  textProps={{ fontSize: 'xs' }}
                />
                <AddressChip
                  address={poolInfo.mintB.address}
                  renderLabel={<TokenAvatar token={poolInfo.mintB} size="xs" />}
                  textProps={{ fontSize: 'xs' }}
                />
              </Box>
            }
          >
            <HStack>
              <TokenAvatarPair size="smi" token1={poolInfo.mintA} token2={poolInfo.mintB} />
              <Text fontSize="md" fontWeight="600">
                {poolInfo.poolName.replace('-', ' / ')}
              </Text>
              <Tag size={['sm', 'md']} variant="rounded">
                {formatToRawLocaleStr(toPercentString(poolInfo.feeRate * 100))}
              </Tag>
            </HStack>
          </Tooltip>
          {isMobile && (
            <Link href={`/clmm/create-position?pool_id=${poolInfo.id}`}>
              <Button
                variant="outline"
                borderColor={colors.primary60}
                color={colors.primary60}
                fontSize="xs"
                height="1.5rem"
                minHeight="1.5rem"
                minWidth="4rem"
                px={2}
              >
                {t('Create')}
              </Button>
            </Link>
          )}
        </Flex>
      </GridItem>
      <GridItem area="price" justifySelf={['stretch', 'left']}>
        <Flex gap={2} justify={['start', 'space-between']} alignItems="center">
          <Text color={colors.textSubtle} fontSize={isMobile ? 'xs' : 'md'}>
            {t('Current Price')}:{' '}
            <Text as="span" color={colors.textPrimary}>
              {baseIn
                ? formatCurrency(poolInfo.price, {
                    decimalPlaces: poolInfo.recommendDecimal(poolInfo.price)
                  })
                : formatCurrency(new Decimal(1).div(poolInfo.price).toString(), {
                    decimalPlaces: poolInfo.recommendDecimal(new Decimal(1).div(poolInfo.price).toString())
                  })}
            </Text>{' '}
            {t('%subA% per %subB%', {
              subA: poolInfo[baseIn ? 'mintB' : 'mintA'].symbol,
              subB: poolInfo[baseIn ? 'mintA' : 'mintB'].symbol
            })}
          </Text>
          {/* switch button */}
          {isMobile ? (
            <SwapHorizIcon onClick={onToggle} color={colors.primary60} />
          ) : (
            <Box alignSelf="center" ml={[0, 2]}>
              <Tooltip label={t('Base/quote tokens have been switched to simplify data display.')}>
                <Box
                  onClick={onToggle}
                  p={1}
                  color={colors.primary60}
                  border={`2px solid ${colors.primary}`}
                  rounded="md"
                  cursor="pointer"
                  display="flex"
                  alignItems="center"
                >
                  <SwapHorizIcon color={colors.primary60} height={18} width={18} />
                </Box>
              </Tooltip>
            </Box>
          )}
        </Flex>
      </GridItem>
      <GridItem area="action" justifySelf={['center', 'right']}>
        {isMobile ? null : (
          <Button size="sm" variant="outline" onClick={handleCreatePositionBtnClick}>
            {t('Create New Position')}
          </Button>
        )}
      </GridItem>
      <GridItem area="items">
        <Flex flexDir="column" mt={[1, 0]} gap={3}>
          {positions.map((position) =>
            hasLockedLiquidity && lockInfo?.[position.nftMint.toBase58()] ? null : (
              <ClmmPositionAccountItem
                key={position.nftMint.toBase58()}
                poolInfo={poolInfo!}
                position={position}
                baseIn={baseIn}
                initRpcPoolData={initRpcPoolData}
                setNoRewardClmmPos={setNoRewardClmmPos}
                onSubscribe={onSubscribe}
              />
            )
          )}
        </Flex>
        {hasLockedLiquidity && (
          <Flex flexDir="column" mt={[0, 3]} gap={3}>
            <HStack gap={1}>
              <Text fontSize={['sm', 'md']} fontWeight="medium" color={colors.lightPurple} pl={1}>
                {t('Locked positions')}
              </Text>
              <QuestionToolTip
                label={
                  <Text as="span" fontSize="sm">
                    {t(
                      'You previously permanently locked the NFT for this position, however trading fees earned are still fully claimable.'
                    )}
                  </Text>
                }
                iconType="info"
                iconProps={{
                  width: 14,
                  height: 14,
                  fill: colors.lightPurple
                }}
              />
            </HStack>
            {lockedPositions.map((position) => (
              <ClmmPositionAccountItem
                key={position.nftMint.toBase58()}
                poolInfo={poolInfo!}
                position={position}
                baseIn={baseIn}
                initRpcPoolData={initRpcPoolData}
                setNoRewardClmmPos={setNoRewardClmmPos}
                lockData={lockInfo?.[position.nftMint.toBase58()]}
                onSubscribe={onSubscribe}
              />
            ))}
          </Flex>
        )}
        <Flex
          align="center"
          justifyContent="center"
          fontSize="sm"
          color={colors.textSeptenary}
          gap={1}
          mt="5"
          onClick={() => loadMore()}
          display={pageCurrent < pageTotal ? 'flex' : 'none'}
        >
          <Text cursor="pointer">{t('Load More')}</Text>
          <ChevronDoubleDownIcon cursor="pointer" width={16} height={16} color={colors.textSeptenary} />
        </Flex>
      </GridItem>
    </Grid>
  )
}

export const ClmmPositionItemsCard = memo(ClmmPositionItemsCardComp)
