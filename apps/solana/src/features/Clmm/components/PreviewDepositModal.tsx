import { Button, Dots } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { ApiV3PoolInfoConcentratedItem } from '@pancakeswap/solana-core-sdk'
import {
  Box,
  Flex,
  Text,
  Badge,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  TextProps
} from '@chakra-ui/react'
import Decimal from 'decimal.js'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import PanelCard from '@/components/PanelCard'
import { getPoolName } from '@/features/Pools/util'
import { getMintSymbol } from '@/utils/token'
import { colors } from '@/theme/cssVariables/colors'
import { panelCard } from '@/theme/cssBlocks'
import toPercentString from '@/utils/numberish/toPercentString'
import { getFirstNonZeroDecimal, formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { Mobile } from '@/components/MobileDesktop'

const SubTitle: React.FC<React.PropsWithChildren<TextProps>> = ({ children, ...props }) => (
  <Text variant="subTitle" color={colors.textSecondary} fontSize="xs" textTransform="uppercase" {...props}>
    {children}
  </Text>
)

interface Props {
  isOpen: boolean
  isSending: boolean
  baseIn: boolean
  onClose: () => void
  onConfirm: () => void
  pool: ApiV3PoolInfoConcentratedItem
  tokenAmount: [string, string]
  priceRange: [string, string]
  tokenPrices: Record<string, { value: number }>
  isCreatePool?: boolean
  isFullRange?: boolean
}

export default function PreviewDepositModal({
  pool,
  priceRange,
  tokenPrices,
  tokenAmount,
  baseIn,
  isSending,
  isCreatePool,
  isFullRange,
  isOpen,
  onConfirm,
  onClose
}: Props) {
  const { t } = useTranslation()
  const [symbolA, symbolB] = [
    getMintSymbol({ mint: pool.mintA, transformSol: true }),
    getMintSymbol({ mint: pool.mintB, transformSol: true })
  ]
  const currentPrice = baseIn ? pool.price : new Decimal(1).div(pool.price).toString()
  const inRange = new Decimal(currentPrice).gte(priceRange[0]) && new Decimal(currentPrice).lte(priceRange[1])
  const decimals = Math.max(pool.mintA.decimals, pool.mintB.decimals)

  const [price0Decimal, price1Decimal] = [getFirstNonZeroDecimal(priceRange[0]), getFirstNonZeroDecimal(priceRange[1])]

  const priceA = tokenPrices[pool.mintA.address]?.value
  const priceB = tokenPrices[pool.mintB.address]?.value
  const validPriceA = priceA !== undefined && priceA >= 0 ? priceA : 0
  const validPriceB = priceB !== undefined && priceB >= 0 ? priceB : 0
  const totalDeposit = new Decimal(tokenAmount[0]).mul(validPriceA).add(new Decimal(tokenAmount[1]).mul(validPriceB))

  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent color={colors.textPrimary} border={`1px solid ${colors.backgroundDark}`}>
        <ModalHeader>{t('Preview Deposit')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box fontSize="sm">
            <Flex alignItems="center">
              <TokenAvatarPair size="sm" token1={pool.mintA} token2={pool.mintB} mr="2" />
              <Text fontWeight="600" fontSize="md">
                {getPoolName(pool).replace(' - ', ' / ')}
              </Text>
              <Badge ml="4" variant={inRange ? 'ok' : 'error'}>
                {inRange ? t('In Range') : t('Out of Range')}
              </Badge>
            </Flex>

            <PanelCard my={['3', '4']} py={['3', '2']} px="4" bg={colors.background}>
              <SubTitle>{t('My Position')}</SubTitle>
              <Flex mt="2" alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" gap="2">
                  <TokenAvatar size="smi" token={pool.mintA} />
                  <Text variant="subTitle" color={colors.textSubtle} fontWeight={400}>
                    {symbolA}
                  </Text>
                </Flex>
                {formatCurrency(tokenAmount[0], {
                  decimalPlaces: pool.mintA.decimals
                })}{' '}
                {symbolA}
              </Flex>
              <Flex mt="2" alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" gap="2">
                  <TokenAvatar size="smi" token={pool.mintB} />
                  <Text variant="subTitle" color={colors.textSubtle} fontWeight={400}>
                    {symbolB}
                  </Text>
                </Flex>
                {formatCurrency(tokenAmount[1], {
                  decimalPlaces: pool.mintB.decimals
                })}{' '}
                {symbolB}
              </Flex>
              <Flex mt="2" justifyContent="space-between">
                <Text color={colors.textSubtle}>{t('Fee Tier')}</Text>
                <Text color={colors.positive60}>
                  {formatToRawLocaleStr(toPercentString(isCreatePool ? pool.feeRate / 10000 : pool.feeRate * 100))}
                </Text>
              </Flex>
            </PanelCard>

            <PanelCard py="3" px="4" bg={colors.background}>
              <Flex mb="2" justifyContent="space-between">
                <SubTitle>{t('Current Price')}</SubTitle>
                <Flex fontSize="sm" gap="1" alignItems="center">
                  {formatCurrency(currentPrice, {
                    decimalPlaces: decimals
                  })}
                  <Text color={colors.textSubtle}>
                    {t('%subA% per %subB%', {
                      subA: baseIn ? symbolB : symbolA,
                      subB: baseIn ? symbolA : symbolB
                    })}
                  </Text>
                </Flex>
              </Flex>

              <SubTitle mb="2">{t('Selected Range')}</SubTitle>

              <Flex gap="4">
                <Flex {...panelCard} flexDirection="column" justifyContent="center" px={[3, 6]} py="3" w="48%" textAlign="center">
                  <SubTitle color={colors.textSubtle}>{t('Min Price')}</SubTitle>
                  <Text fontSize={['md', 'xl']} fontWeight="600" color={colors.textPrimary}>
                    {isFullRange
                      ? '0'
                      : price0Decimal > decimals
                      ? formatCurrency(new Decimal(priceRange[0]).toFixed(24), { maximumDecimalTrailingZeroes: 5 })
                      : formatCurrency(new Decimal(priceRange[0]).toDecimalPlaces(decimals).toFixed(24), {
                          maximumDecimalTrailingZeroes: 5
                        })}
                  </Text>
                  <Text variant="subTitle" fontWeight={400} color={colors.textSubtle}>
                    {t('%subA% per %subB%', {
                      subA: baseIn ? symbolB : symbolA,
                      subB: baseIn ? symbolA : symbolB
                    })}
                  </Text>
                </Flex>

                <Flex {...panelCard} flexDirection="column" justifyContent="center" px={[3, 6]} py="3" w="48%" textAlign="center">
                  <SubTitle color={colors.textSubtle}>{t('Max Price')}</SubTitle>
                  <Text fontSize={['md', 'xl']} fontWeight="600" color={colors.textPrimary}>
                    {isFullRange
                      ? '∞'
                      : price1Decimal > decimals
                      ? formatCurrency(new Decimal(priceRange[1]).toFixed(24), { maximumDecimalTrailingZeroes: 5, abbreviated: true })
                      : formatCurrency(new Decimal(priceRange[1]).toDecimalPlaces(decimals).toFixed(24), {
                          maximumDecimalTrailingZeroes: 5,
                          abbreviated: true
                        })}
                  </Text>
                  <Text variant="subTitle" fontWeight={400} color={colors.textSubtle}>
                    {t('%subA% per %subB%', {
                      subA: baseIn ? symbolB : symbolA,
                      subB: baseIn ? symbolA : symbolB
                    })}
                  </Text>
                </Flex>
              </Flex>
            </PanelCard>

            <PanelCard my={[3, '4']} py="2" px="4" bg={colors.background}>
              <Flex justifyContent="space-between" alignItems="center">
                <SubTitle>{t('Total Deposit')}</SubTitle>
                <Text fontSize="md" fontWeight="600">
                  {formatCurrency(totalDeposit.toString(), {
                    symbol: '$',
                    decimalPlaces: 2
                  })}
                </Text>
              </Flex>
            </PanelCard>
          </Box>
        </ModalBody>
        <ModalFooter px="0" py="0" mt="4" mb="2">
          <Button width="100%" onClick={onConfirm} isLoading={isSending}>
            {isSending ? (
              <>
                {t('Transaction initiating')}
                <Dots />
              </>
            ) : (
              t('Confirm Deposit')
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
