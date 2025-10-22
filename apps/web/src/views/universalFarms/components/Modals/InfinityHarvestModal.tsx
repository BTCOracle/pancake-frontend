import { chainNames } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { useTheme } from '@pancakeswap/hooks'
import { getPoolId } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { type Currency } from '@pancakeswap/swap-sdk-core'
import { bscTokens } from '@pancakeswap/tokens'
import {
  AutoColumn,
  AutoRow,
  Button,
  ExpandableLabel,
  FlexGap,
  Modal,
  ModalV2,
  ModalV2Props,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { formatFiatNumber } from '@pancakeswap/utils/formatFiatNumber'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import {
  CurrencyLogo,
  DoubleCurrencyLogo,
  ExpandableLabelContainer,
  GreyCard,
  Tips,
  TokenOverview,
} from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'
import { InfinityFeeTierBreakdown } from 'components/FeeTierBreakdown'
import { TokenPairLogo } from 'components/TokenImage'
import { useUserAllFarmRewardsByChainIdFromAPI } from 'hooks/infinity/useFarmReward'
import { useFeesEarnedUSD } from 'hooks/infinity/useFeesEarned'
import { useCakePrice } from 'hooks/useCakePrice'
import { useMemo, useState } from 'react'
import { getKeyForPools } from 'state/farmsV4/hooks'
import type { InfinityBinPositionDetail, InfinityCLPositionDetail } from 'state/farmsV4/state/accountPositions/type'
import styled from 'styled-components'
import { usePositionEarningAmount } from 'views/universalFarms/hooks/usePositionEarningAmount'
import { getChainFullName } from 'views/universalFarms/utils'
import { useAccount } from 'wagmi'

import { InfinityBinPositionItem } from '../PositionItem/InfinityBinPositionItem'
import { InfinityCLPositionItem } from '../PositionItem/InfinityCLPositionItem'

export type InfinityHarvestProps = {
  pos?: InfinityCLPositionDetail | InfinityBinPositionDetail
  currency0: Currency
  currency1: Currency
  positionList?: (InfinityCLPositionDetail | InfinityBinPositionDetail)[]
  showPositionFees?: boolean
  chainId?: number
  onHarvest?: () => void
  onCollect?: () => void
}

type InfinityHarvestModalProps = ModalV2Props & InfinityHarvestProps

const ListContainer = styled.div<{ $num: number; $visible: boolean }>`
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
  padding: 6px;
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: auto;
  min-height: ${({ $num }) => ($num === 0 ? 'auto' : $num === 1 ? '190px' : '300px')};
  max-height: calc(100vh - 600px);

  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 12px;
  }
`

export const InfinityHarvestModal = ({
  pos: pos_,
  positionList,
  currency0,
  currency1,
  isOpen,
  closeOnOverlayClick,
  showPositionFees = true,
  onDismiss,
  onHarvest,
  onCollect,
  chainId: chainId_,
}: InfinityHarvestModalProps) => {
  const pos = pos_ ?? positionList?.[0]

  const { protocol, chainId: chainIdPos, poolKey } = pos ?? {}

  const chainId = chainId_ ?? chainIdPos

  const { t } = useTranslation()
  const { theme } = useTheme()
  const { address } = useAccount()
  const [isExpanded, setIsExpanded] = useState(false)

  const [positionEarningAmount] = usePositionEarningAmount()
  const stakedPositions = useMemo(
    () =>
      positionList?.filter((p) => {
        return p.protocol === Protocol.InfinityCLAMM
          ? positionEarningAmount?.[p.chainId]?.[p.poolId]?.[(p as InfinityCLPositionDetail).tokenId.toString()] ?? true
          : positionEarningAmount?.[p.chainId]?.[p.poolId] ?? true
      }),
    [positionList, positionEarningAmount],
  )

  // farming rewards
  const { totalUnclaimedRewards } = useUserAllFarmRewardsByChainIdFromAPI({
    chainId,
    user: address,
  })
  const totalRewardsAmount = totalUnclaimedRewards.reduce(
    (acc, item) => new BigNumber(item.totalReward).plus(acc),
    new BigNumber(0),
  )
  const cakePrice = useCakePrice()
  const totalRewardsUSD = totalRewardsAmount.times(cakePrice)
  const poolId = poolKey ? getPoolId(poolKey) : undefined

  // LP fee
  const { feeAmount0, feeAmount1, totalFiatValue } = useFeesEarnedUSD({
    currency0,
    currency1,
    tickLower: pos && ('tickLower' in pos ? pos.tickLower : undefined),
    tickUpper: pos && ('tickUpper' in pos ? pos.tickUpper : undefined),
    tokenId: pos && ('tokenId' in pos ? pos.tokenId : undefined),
    poolId: pos ? poolId : undefined,
    enabled: showPositionFees && !!pos,
  })

  const { isMobile } = useMatchBreakpoints()
  const bodyPadding = useMemo(() => (isMobile ? '0px 4px 8px' : '0px 24px 24px'), [isMobile])

  return (
    <ModalV2 onDismiss={onDismiss} isOpen={isOpen} closeOnOverlayClick={closeOnOverlayClick}>
      <Modal
        width={['100%', '100%', '100%', '480px']}
        title={t('Harvest Infinity Farms')}
        headerBorderColor="transparent"
        bodyPadding={bodyPadding}
      >
        <FlexGap gap="24px" alignItems="flex-start" flexDirection="column">
          <TokenOverview
            isReady
            token={currency0}
            quoteToken={currency1}
            iconWidth="48px"
            title={
              <FlexGap gap="4px" alignItems="center">
                <Text as="span" bold fontSize="20px" mr="8px">{`${currency0.symbol} / ${currency1.symbol}`}</Text>
                <InfinityFeeTierBreakdown poolId={poolId} chainId={chainId} />
              </FlexGap>
            }
            getChainName={getChainFullName}
            icon={
              <TokenPairLogo
                width={44}
                height={44}
                variant="inverted"
                primaryToken={currency0}
                secondaryToken={currency1.wrapped}
              />
            }
          />
          <Tips
            primaryMsg={t('Harvesting earnings from all Infinity farming positions under %chainName%', {
              chainName: chainId ? chainNames[chainId] : '',
            })}
          />
          <GreyCard border={`1px solid ${theme.colors.cardBorder}`} padding="0">
            <AutoColumn padding="12px">
              <Text textTransform="uppercase">
                <Text color="textSubtle" as="span" fontSize="12px" fontWeight={600}>
                  {t('Total earnings from ')}
                </Text>
                <Text color="secondary" as="span" fontSize="12px" fontWeight={600}>
                  {t('%num% Positions', { num: stakedPositions?.length ?? 0 })}
                </Text>
              </Text>
              <AutoRow justifyContent="space-between" gap="8px">
                <AutoColumn justifyContent="flex-start">
                  <Text mt="8px" as="h3" fontWeight={600} fontSize={24}>
                    {formatFiatNumber(totalRewardsUSD.toFixed(18))}
                  </Text>
                  <AutoRow gap="8px">
                    <CurrencyLogo currency={bscTokens.cake} />
                    <Text color="textSubtle" fontSize={14}>
                      {formatNumber(totalRewardsAmount.toFixed(18))} CAKE
                    </Text>
                  </AutoRow>
                </AutoColumn>
                <Button
                  width={['100%', '100%', 'auto']}
                  onClick={onHarvest}
                  disabled={totalRewardsAmount.isLessThanOrEqualTo(0)}
                >
                  {t('Harvest All')}
                </Button>
              </AutoRow>
              {stakedPositions?.length ? (
                <ExpandableLabelContainer style={{ textAlign: 'center' }}>
                  <ExpandableLabel expanded={isExpanded} onClick={() => setIsExpanded((prev) => !prev)}>
                    {isExpanded ? t('Hide') : t('Details')}
                  </ExpandableLabel>
                </ExpandableLabelContainer>
              ) : null}
            </AutoColumn>
            <ListContainer $visible={isExpanded} $num={stakedPositions?.length ?? 0}>
              {stakedPositions?.map((p) => {
                if (p.protocol === Protocol.InfinityCLAMM) {
                  return (
                    <InfinityCLPositionItem
                      key={getKeyForPools({
                        chainId: p.chainId,
                        poolAddress: p.poolId,
                        tokenId: p.tokenId,
                        protocol: p.protocol,
                      })}
                      data={p}
                      showAPR={false}
                      miniMode
                    />
                  )
                }
                if (p.protocol === Protocol.InfinityBIN) {
                  return (
                    <InfinityBinPositionItem
                      key={getKeyForPools({
                        chainId: p.chainId,
                        poolAddress: p.poolId,
                        tokenId: (p as InfinityBinPositionDetail).activeId.toString(),
                        protocol: p.protocol,
                      })}
                      miniMode
                      showAPR={false}
                      data={p as InfinityBinPositionDetail}
                    />
                  )
                }
                return null
              })}
            </ListContainer>
          </GreyCard>

          {showPositionFees && protocol === Protocol.InfinityCLAMM ? (
            <AutoColumn padding="12px" width="100%">
              <Text color="textSubtle" as="span" fontSize="12px" fontWeight={600} textTransform="uppercase">
                {t('Unclaimed Fees')}
              </Text>
              <AutoRow justifyContent="space-between" gap="8px">
                <AutoColumn justifyContent="flex-start" flex={1}>
                  <Text as="h3" fontWeight={600} fontSize={24}>
                    {formatFiatNumber(totalFiatValue?.toExact() ?? 0)}
                  </Text>
                  <AutoRow gap="8px">
                    <DoubleCurrencyLogo currency0={currency0} currency1={currency1} innerMargin="-4px" />
                    <Text color="textSubtle" fontSize={14}>
                      {`${formatNumber(feeAmount0?.toFixed() ?? 0)} ${currency0.symbol} + ${formatNumber(
                        feeAmount1?.toFixed() ?? 0,
                      )} ${currency1.symbol}`}
                    </Text>
                  </AutoRow>
                </AutoColumn>
                <Button
                  width={['100%', '100%', 'auto']}
                  onClick={onCollect}
                  disabled={!(feeAmount0?.greaterThan(0) || feeAmount1?.greaterThan(0))}
                >
                  {t('Collect')}
                </Button>
              </AutoRow>
            </AutoColumn>
          ) : null}
        </FlexGap>
      </Modal>
    </ModalV2>
  )
}
