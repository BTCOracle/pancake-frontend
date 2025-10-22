import {
  AutoColumn,
  Card,
  CardBody,
  FlexGap,
  Box,
  Flex,
  useMatchBreakpoints,
  Text,
  SwapHorizIcon,
  Link,
  OpenNewIcon,
  CopyButton,
  Image,
  Tag,
} from '@pancakeswap/uikit'
import { CurrencyLogo, DoubleCurrencyLogo, FeeTierTooltip, LightGreyCard } from '@pancakeswap/widgets-internal'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { useTranslation } from '@pancakeswap/localization'
import { Tooltips } from 'components/Tooltips'
import { Protocol } from '@pancakeswap/farms'
import BigNumber from 'bignumber.js'
import { useAtomValue } from 'jotai'
import { solanaExplorerAtom } from '@pancakeswap/utils/user'
import { getSolExplorerLink } from 'utils'
import { useMemo } from 'react'
import { Percent } from '@pancakeswap/swap-sdk-core'
import { useFlipCurrentPrice } from 'views/PoolDetail/state/flipCurrentPrice'
import { useSolanaTokenPrice } from 'hooks/solana/useSolanaTokenPrice'
import { useSolanaV3PositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { SolanaV3PoolPositionAprButton } from 'views/universalFarms/components'
import { TickUtils } from '@pancakeswap/solana-core-sdk'
import { RangeTag } from 'components/RangeTag'
import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { useSolanaV3Position } from '../hooks/useSolanaV3Position'
import { usePoolInfoByQuery } from '../hooks/usePoolInfoByQuery'
import { usePoolCurrencies } from '../hooks/usePoolCurrencies'

export const PoolInfoCard = () => {
  const { t } = useTranslation()
  const { mintId } = useSolanaV3PositionIdRouteParams()
  const { currency0, currency1, poolSymbol } = usePoolCurrencies()
  const { isMobile, isMd } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isMd
  const currentExplorer = useAtomValue(solanaExplorerAtom)
  const pool = usePoolInfoByQuery()
  const fee = useMemo(() => {
    const f = new BigNumber(pool?.feeTier ?? 0)
    const [numerator, denominator] = f.toFraction()
    return new Percent(numerator.toString(), denominator.toString())
  }, [pool?.feeTier])
  const [flipCurrentPrice, setFlipCurrentPrice] = useFlipCurrentPrice()

  const price = useMemo(() => {
    if (!pool?.rawPool?.tickCurrent) return undefined
    const p = TickUtils.getTickPrice({
      poolInfo: pool.rawPool,
      tick: pool.rawPool.tickCurrent,
      baseIn: !flipCurrentPrice,
    })
    return parseFloat(p.price.toFixed(18))
  }, [pool, flipCurrentPrice])

  const position = useSolanaV3Position(mintId)

  return (
    <Card>
      <CardBody>
        <FlexGap
          justifyContent="space-between"
          alignItems={isSmallScreen ? 'flex-start' : 'center'}
          flexDirection={isSmallScreen ? 'column' : 'row'}
          gap="16px"
        >
          <FlexGap
            gap="16px"
            justifyContent={isSmallScreen ? 'space-between' : 'flex-start'}
            flexDirection="row"
            width="100%"
          >
            <FlexGap flexDirection="column" gap="16px">
              <FlexGap
                gap="12px"
                alignItems={isSmallScreen ? 'flex-start' : 'center'}
                flexDirection={isSmallScreen ? 'column' : 'row'}
              >
                <Box>
                  <Flex alignItems="center" justifyContent="center" position="relative">
                    <DoubleCurrencyLogo
                      currency0={currency0 ?? undefined}
                      currency1={currency1 ?? undefined}
                      size={48}
                      innerMargin="2px"
                      showChainLogoCurrency1
                    />
                  </Flex>
                </Box>
                <FlexGap gap="4px" alignItems="center">
                  <Text bold fontSize={32} style={{ lineHeight: '1' }}>
                    {currency0?.symbol}
                  </Text>
                  <Text color="textSubtle" bold fontSize={32} style={{ lineHeight: '1' }}>
                    /
                  </Text>
                  <Text bold fontSize={32} style={{ lineHeight: '1' }}>
                    {currency1?.symbol}
                  </Text>
                </FlexGap>
                <Tooltips
                  content={
                    <FlexGap gap="4px" flexDirection="column" minWidth="150px">
                      <FlexGap gap="16px" justifyContent="space-between" alignItems="center">
                        <FlexGap gap="8px">
                          <Text>{t('NFT mint:')}</Text>
                        </FlexGap>

                        <FlexGap gap="4px">
                          {mintId ? (
                            <Link target="_blank" href={getSolExplorerLink(mintId, 'address', currentExplorer.host)}>
                              <OpenNewIcon width={16} height={16} color="primary60" />
                            </Link>
                          ) : null}
                          <CopyButton
                            text={position?.nftMint.toBase58() ?? ''}
                            tooltipMessage={t('NFT mint copied')}
                            width="16px"
                            height="16px"
                          />
                        </FlexGap>
                      </FlexGap>
                      <FlexGap gap="16px" justifyContent="space-between" alignItems="center">
                        <FlexGap gap="8px">
                          <CurrencyLogo currency={currency0 ?? undefined} size="24px" />
                          <Text>{currency0?.symbol}</Text>
                        </FlexGap>
                        {currency0?.isToken && currency0?.wrapped?.address && (
                          <FlexGap gap="4px">
                            <Link
                              target="_blank"
                              href={getSolExplorerLink(currency0?.wrapped?.address, 'address', currentExplorer.host)}
                            >
                              <OpenNewIcon width={16} height={16} color="primary60" />
                            </Link>
                            <CopyButton
                              text={currency0?.wrapped?.address ?? ''}
                              tooltipMessage={t('Token address copied')}
                              width="16px"
                              height="16px"
                            />
                          </FlexGap>
                        )}
                      </FlexGap>
                      <FlexGap gap="16px" justifyContent="space-between" alignItems="center">
                        <FlexGap gap="8px">
                          <CurrencyLogo currency={currency1 ?? undefined} size="24px" />
                          <Text>{currency1?.symbol}</Text>
                        </FlexGap>
                        {currency1?.isToken && currency1?.wrapped?.address && (
                          <FlexGap gap="4px">
                            <Link
                              target="_blank"
                              href={getSolExplorerLink(currency1?.wrapped?.address, 'address', currentExplorer.host)}
                            >
                              <OpenNewIcon width={16} height={16} color="primary60" />
                            </Link>
                            <CopyButton
                              text={currency1?.wrapped?.address ?? ''}
                              tooltipMessage={t('Token address copied')}
                              width="16px"
                              height="16px"
                            />
                          </FlexGap>
                        )}
                      </FlexGap>
                    </FlexGap>
                  }
                >
                  <Box height={24} width={24}>
                    <Image width={24} height={24} src={currentExplorer.icon} alt={currentExplorer.name} />
                  </Box>
                </Tooltips>
              </FlexGap>
              <FlexGap gap="16px" flexWrap="wrap" alignItems="center" alignContent="center">
                <AutoColumn rowGap="4px">
                  <Box>
                    <FeeTierTooltip type={Protocol.V3} percent={fee} showType={false} />
                  </Box>
                </AutoColumn>
                {pool?.isFarming ? <Tag variant="primary60">{t('Farming')}</Tag> : null}
                <RangeTag
                  lowContrast
                  outOfRange={position?.status === POSITION_STATUS.INACTIVE}
                  removed={position?.liquidity.isZero()}
                />
              </FlexGap>
            </FlexGap>
          </FlexGap>

          <FlexGap gap="16px" flexDirection={['column', null, 'row']}>
            <Box p="8px 16px" width="100%">
              <FlexGap gap="8px" alignItems="center">
                <Text fontSize={12} bold color="textSubtle" textTransform="uppercase" style={{ userSelect: 'none' }}>
                  {t('Current Price')}
                </Text>
                <SwapHorizIcon
                  color="primary60"
                  onClick={() => setFlipCurrentPrice(!flipCurrentPrice)}
                  style={{ cursor: 'pointer' }}
                />
              </FlexGap>
              <FlexGap mt="2px" gap="8px" alignItems="center" width="100%">
                <Text fontSize={28} bold width="max-content">
                  {formatNumber(Number(price ?? 0), {
                    maximumSignificantDigits: 6,
                    maxDecimalDisplayDigits: 6,
                  })}
                </Text>

                <Text fontSize={12} color="textSubtle" textTransform="uppercase" width="max-content">
                  {t(
                    '%assetA% = 1 %assetB%',
                    flipCurrentPrice
                      ? {
                          assetA: currency0?.symbol,
                          assetB: currency1?.symbol,
                        }
                      : {
                          assetA: currency1?.symbol,
                          assetB: currency0?.symbol,
                        },
                  )}
                </Text>
              </FlexGap>
            </Box>
            <LightGreyCard padding="8px 16px">
              <AutoColumn rowGap="2px">
                <FlexGap>
                  <Text fontSize={12} bold color="textSubtle" textTransform="uppercase" minWidth="max-content">
                    {t('Est. APR')}
                  </Text>
                </FlexGap>
                {pool && position ? (
                  <SolanaV3PoolPositionAprButton
                    pool={pool}
                    userPosition={position}
                    textProps={{
                      fontSize: '32px',
                      fontWeight: 600,
                      color: 'secondary',
                    }}
                  />
                ) : null}
              </AutoColumn>
            </LightGreyCard>
          </FlexGap>
        </FlexGap>
      </CardBody>
    </Card>
  )
}
