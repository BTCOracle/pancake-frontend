import { useCallback, useMemo, useState } from 'react'
import { Center, Flex, Grid, GridItem, HStack, Tag, Text } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { useRouter } from 'next/router'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { FormattedPoolInfoItem } from '@/hooks/pool/type'
import { colors } from '@/theme/cssVariables'
import { useAppStore } from '@/store'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import StarIcon from '@/icons/misc/StarIcon'
import Tooltip from '@/components/Tooltip'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import OpenBookIcon from '@/icons/misc/OpenBookIcon'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import { FILED_KEY, getFavoritePoolCache, setFavoritePoolCache, TimeBase } from '../../util'
import PoolDetailMobileDrawer from '../PoolDetailMobileDrawer'

export const ColumnPoolName: React.FC<{
  data: FormattedPoolInfoItem
  timeBase: TimeBase
}> = ({ data: pool, timeBase }) => {
  const { t } = useTranslation()
  const isMobile = useAppStore((s) => s.isMobile)
  const [isFavorite, setIsFavoriteState] = useState(getFavoritePoolCache().has(pool.id))
  const field = FILED_KEY[timeBase]
  const timeData = useMemo(() => pool[field], [pool, field])

  const feeApr = pool?.allApr[field].find((s) => s.isTradingFee)
  const rewardApr = useMemo(() => pool?.allApr[field].filter((s) => !s.isTradingFee && !!s.token) || [], [field, pool?.allApr])
  const aprData = useMemo(
    () => ({
      fee: {
        apr: feeApr?.apr || 0,
        percentInTotal: feeApr?.percent || 0
      },
      rewards:
        rewardApr.map((r) => ({
          apr: r.apr,
          percentInTotal: r.percent,
          mint: r.token!
        })) || [],
      apr: rewardApr.reduce((acc, cur) => acc + cur.apr, 0) + (feeApr?.apr || 0)
    }),
    [feeApr?.apr, feeApr?.percent, rewardApr]
  )

  const { isOpen: isPoolDetailOpen, onOpen: onPoolDetailOpen, onClose: onPoolDetailClose } = useDisclosure()

  const onPoolClick = useCallback(() => {
    isMobile && onPoolDetailOpen()
  }, [isMobile, onPoolDetailOpen])

  const router = useRouter()

  const onClickDeposit = useCallback(() => {
    const isStandard = pool.type === 'Standard'
    router.push({
      pathname: isStandard ? '/liquidity/increase' : '/clmm/create-position',
      query: {
        ...(isStandard ? { mode: 'add' } : {}),
        pool_id: pool.id
      }
    })
  }, [pool])

  const onFavoriteClick = () => {
    setIsFavoriteState((v) => !v)
    setFavoritePoolCache(pool.id)
  }

  const [baseToken, quoteToken] = useMemo(
    () => [
      { ...pool.mintA, priority: 3 },
      { ...pool.mintB, priority: 3 }
    ],
    [pool.mintA, pool.mintB]
  )
  const pairName = useMemo(() => {
    const [token0Name, token1Name] = pool.poolName.replaceAll(/\s+/g, '').split('-')
    if (!token0Name || !token1Name) {
      return pool.poolName
    }
    return (
      <Flex gap="4px" fontWeight={600} fontSize="16px">
        <Text color={colors.textPrimary} lineHeight={1.5}>
          {token0Name}
        </Text>
        <Text color={colors.textSubtle} lineHeight={1.5}>
          /
        </Text>
        <Text color={colors.textPrimary} lineHeight={1.5}>
          {token1Name}
        </Text>
      </Flex>
    )
  }, [pool.poolName])

  const infoToolTipLabel = useMemo(
    () => (
      <Flex width="252px" gap="8px" flexDir="column">
        <AddressChip
          address={pool.id}
          renderLabel={`${t('Pool id')}`}
          mb="2"
          textProps={{ fontSize: 'xs', color: colors.primary }}
          iconProps={{ color: colors.primary }}
          color={colors.textSubtle}
          justifyContent="space-between"
          fontSize="16px"
        />
        <AddressChip
          address={baseToken.address}
          renderLabel={
            <Flex gap="8px" justifyContent="flex-start" alignItems="center">
              <TokenAvatar token={baseToken} size="xs" />
              {baseToken.symbol}
            </Flex>
          }
          textProps={{ fontSize: 'xs', color: colors.primary }}
          iconProps={{ color: colors.primary }}
          color={colors.textSubtle}
          justifyContent="space-between"
        />
        <AddressChip
          address={quoteToken.address}
          renderLabel={
            <Flex gap="8px" justifyContent="flex-start" alignItems="center">
              <TokenAvatar token={quoteToken} size="xs" />
              {quoteToken.symbol}
            </Flex>
          }
          textProps={{ fontSize: 'xs', color: colors.primary }}
          iconProps={{ color: colors.primary }}
          color={colors.textSubtle}
          justifyContent="space-between"
        />
      </Flex>
    ),
    [baseToken, pool.id, quoteToken, t]
  )

  return (
    <>
      <Flex align="center" h="100%" gap={[2, 4]} onClick={onPoolClick}>
        <Desktop>
          <Center width={6} height={6}>
            <StarIcon selected={isFavorite} onClick={onFavoriteClick} style={{ cursor: 'pointer', minWidth: '16px' }} />
          </Center>
        </Desktop>
        <Tooltip usePortal variant="card" label={infoToolTipLabel}>
          <Grid
            gridTemplate={[
              `
                  "a n" auto
                  "t t" auto / auto 1fr`,
              `
                  "a t" auto
                  "n n" auto / auto 1fr`,
              `
                  "a n" auto
                  "a t" auto / auto 1fr`
            ]}
            columnGap={[1, 2]}
            rowGap={[1, 1]}
            alignItems="center"
          >
            {/* token pair avatar */}
            <GridItem area="a">
              <TokenAvatarPair token1={baseToken} token2={quoteToken} size={['sm', 'smi']} />
            </GridItem>

            {/* name */}
            <GridItem area="n">{pairName}</GridItem>

            {/* tags */}
            <GridItem area="t">
              <HStack align="center">
                <Tag size="sm" variant="rounded">
                  {formatToRawLocaleStr(toPercentString(pool.feeRate * 100))}
                </Tag>

                {pool.isOpenBook && (
                  <Tooltip label="This pool shares liquidity to the OpenBook order-book">
                    <Flex alignItems="center">
                      <Tag size="sm" variant="rounded">
                        <OpenBookIcon />
                      </Tag>
                    </Flex>
                  </Tooltip>
                )}
              </HStack>
            </GridItem>
          </Grid>
        </Tooltip>
      </Flex>
      <Mobile>
        <PoolDetailMobileDrawer
          poolId={pool.id}
          pairName={pool.poolName}
          isOpen={isPoolDetailOpen}
          baseToken={baseToken}
          quoteToken={quoteToken}
          isFavorite={isFavorite}
          onFavoriteClick={onFavoriteClick}
          feeTier={pool.feeRate * 100}
          isOpenBook={pool.isOpenBook}
          onClose={onPoolDetailClose}
          onDeposit={onClickDeposit}
          timeBase={timeBase}
          volume={formatCurrency(timeData.volume, { symbol: '$', decimalPlaces: 2 })}
          fees={formatCurrency(timeData.volumeFee, { symbol: '$', decimalPlaces: 2 })}
          tvl={formatCurrency(pool.tvl, { symbol: '$', decimalPlaces: 2 })}
          aprData={aprData}
          weeklyRewards={pool.weeklyRewards}
          isEcosystem={pool.rewardDefaultPoolInfos === 'Ecosystem'}
        />
      </Mobile>
    </>
  )
}
