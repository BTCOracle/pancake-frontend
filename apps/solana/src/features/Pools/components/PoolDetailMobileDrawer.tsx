import { Button } from '@pancakeswap/uikit'
import {
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  HStack,
  SimpleGrid,
  Tag,
  Text,
  VStack
} from '@chakra-ui/react'
import { ApiV3Token, TokenInfo } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import React from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { panelCard } from '@/theme/cssBlocks'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { AprData } from '@/features/Clmm/utils/calApr'
import { WeeklyRewardData } from '@/hooks/pool/type'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import OpenBookIcon from '@/icons/misc/OpenBookIcon'
import StarIcon from '@/icons/misc/StarIcon'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintSymbol, wSolToSolString } from '@/utils/token'
import { toAPRPercent } from '../util'
import { ChartWindow } from './PoolChart'
import { aprColors } from './PoolListItemAprLine'
import { PoolListItemAprPie } from './PoolListItemAprPie'

type PoolDetailMobileDrawerProps = {
  pairName: string
  baseToken: TokenInfo | ApiV3Token | undefined
  quoteToken: TokenInfo | ApiV3Token | undefined
  isFavorite: boolean
  poolId: string
  onFavoriteClick: () => void
  feeTier: string | number
  isOpenBook: boolean
  timeBase: string
  volume?: string
  fees?: string
  tvl?: string
  aprData: AprData
  weeklyRewards: WeeklyRewardData
  isEcosystem: boolean
  isOpen: boolean
  onClose: () => void
  onDeposit: () => void
}

function ContentCard({ children }: { children: React.ReactNode }) {
  return (
    <Box {...panelCard} bg={colors.background} w="full" px={4} py={4}>
      {children}
    </Box>
  )
}

export default function PoolDetailMobileDrawer({
  pairName,
  baseToken,
  quoteToken,
  isFavorite,
  poolId,
  onFavoriteClick,
  feeTier,
  isOpenBook,
  timeBase,
  volume,
  fees,
  tvl,
  aprData,
  weeklyRewards,
  isEcosystem,
  isOpen,
  onClose,
  onDeposit
}: PoolDetailMobileDrawerProps) {
  const { t } = useTranslation()
  const { data: tokenPrices } = useTokenPrice({
    mintList: weeklyRewards.map((r) => r.token.address)
  })

  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody mt={8}>
          <Flex direction="column" justify="flex-start" align="center" gap={3}>
            <TokenAvatarPair token1={baseToken} token2={quoteToken} size="lg" pl="3.5%" />
            <SimpleGrid templateColumns="repeat(3, 1fr)" alignItems="center">
              <Box />
              <Text fontSize="md" fontWeight="600" whiteSpace="nowrap">
                {pairName.replace('-', ' / ')}
              </Text>
              <StarIcon selected={isFavorite} onClick={onFavoriteClick} style={{ cursor: 'pointer', marginLeft: '6px' }} />
            </SimpleGrid>
            <HStack>
              <Tag size="sm" variant="rounded">
                {feeTier}%
              </Tag>
              {isOpenBook ? (
                <Tag size="sm" variant="rounded">
                  <OpenBookIcon />
                </Tag>
              ) : null}
            </HStack>
          </Flex>
          <VStack mt={5} spacing={3}>
            <ContentCard>
              <HStack justify="space-between">
                {[
                  {
                    label: t(`Volume %timeBase%`, { timeBase }),
                    value: volume
                  },
                  {
                    label: t(`Fees %timeBase%`, { timeBase }),
                    value: fees
                  },
                  {
                    label: t('TVL'),
                    value: tvl
                  }
                ].map(({ label, value }) => (
                  <Flex direction="column" gap={2}>
                    <Text fontSize="xs" color={colors.textSubtle} textTransform="uppercase">
                      {label}
                    </Text>
                    <Text fontWeight={600} textAlign="start">
                      {value}
                    </Text>
                  </Flex>
                ))}
              </HStack>
            </ContentCard>
            <ContentCard>
              <Flex w="full" gap={4}>
                <Flex flex={1} justify="space-between" align="center">
                  <Flex direction="column" gap="6px">
                    <Text fontSize="xs" color={colors.textSubtle} textTransform="uppercase">
                      {t('Total APR')}
                    </Text>
                    <Text fontSize="md" fontWeight="600">
                      {toAPRPercent(aprData.apr)}
                    </Text>
                  </Flex>
                  <PoolListItemAprPie aprs={aprData} w={12} h={12} />
                </Flex>
                <Flex flex={1} direction="column" gap={2}>
                  <Flex w="full" gap={4} justify="space-between" align="center">
                    <Flex fontSize="xs" fontWeight="normal" color={colors.textSubtle} justify="flex-start" align="center">
                      <Box rounded="full" bg={aprColors[0]} w="7px" h="7px" mr="8px" />
                      {t('Trade fees')}
                    </Flex>
                    <Box fontSize="xs" color={colors.textPrimary}>
                      {toAPRPercent(aprData.fee.apr)}
                    </Box>
                  </Flex>
                  {aprData.rewards.map(({ apr, mint: token }, idx) => (
                    <Flex w="full" gap={4} key={`reward-${token?.symbol}-${idx}`} justify="space-between" align="center">
                      <Flex fontSize="xs" fontWeight="normal" color={colors.textSubtle} justify="flex-start" align="center">
                        <Box rounded="full" bg={aprColors[idx + 1]} w="7px" h="7px" mr="8px" />
                        <Text>{wSolToSolString(token?.symbol)}</Text>
                      </Flex>
                      <Box fontSize="xs" color={colors.textPrimary}>
                        {toAPRPercent(apr)}
                      </Box>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            </ContentCard>
            {weeklyRewards.length !== 0 && (
              <ContentCard>
                <Flex gap="2" alignItems="center">
                  <Text fontSize="xs" color={colors.textSubtle} textTransform="uppercase">
                    {t('Weekly Rewards')}
                  </Text>
                  {isEcosystem ? <Badge variant="crooked">{t('Ecosystem')}</Badge> : null}
                </Flex>
                <SimpleGrid templateColumns="repeat(2, 1fr)" columnGap={2}>
                  {weeklyRewards.map((reward) => (
                    <Flex w="full" key={String(reward.token?.address)} align="center" fontSize="12px" mt="8px" gap={1}>
                      <HStack fontWeight="normal" color={colors.textSubtle} spacing={1}>
                        <TokenAvatar size="sm" token={reward.token} />
                        <Box color={colors.success} fontWeight="600">
                          {formatCurrency(reward.amount, { decimalPlaces: 2 })}
                        </Box>
                        <Box color={colors.textPrimary}>{getMintSymbol({ mint: reward.token, transformSol: true })}</Box>
                      </HStack>
                      <Box color={colors.textSubtle}>
                        (
                        {formatCurrency(new Decimal(tokenPrices[reward.token.address]?.value || 0).mul(reward.amount).toString(), {
                          symbol: '$',
                          decimalPlaces: 2
                        })}
                        )
                      </Box>
                    </Flex>
                  ))}
                </SimpleGrid>
              </ContentCard>
            )}

            <Box w="full">
              <ChartWindow
                poolAddress={poolId}
                baseMint={baseToken?.address}
                categories={[
                  { label: 'Volume', value: 'volume' },
                  { label: 'Liquidity', value: 'liquidity' },
                  { label: 'TVL', value: 'tvl' }
                ]}
              />
            </Box>
          </VStack>
        </DrawerBody>
        <DrawerFooter bg="transparent">
          <Button onClick={onDeposit} width="100%" variant="primary">
            {t('Deposit')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
