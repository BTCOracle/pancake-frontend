import { Box, Button, Flex, Grid, GridItem, HStack, Skeleton, Text, useDisclosure } from '@chakra-ui/react'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { BN } from 'bn.js'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { colors } from '@/theme/cssVariables/colors'
import { routeBack } from '@/utils/routeTools'
import LockedNFTModal from '@/features/Liquidity/Lock/components/LockedNFTModal'
import useAllPositionInfo from '@/hooks/portfolio/useAllPositionInfo'
import { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import LiquidityItem from './components/LiquidityItem'
import LiquidityLockModal from './components/LiquidityLockModal'

export default function Lock() {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isNFTOpen, onOpen: onNFTOpen, onClose: onNFTClose } = useDisclosure()
  const [nftAddress, setNFTAddress] = useState('')
  const { clmmBalanceInfo, formattedClmmDataMap, clmmLockInfo, mutateClmmLockInfo, isLoading } = useAllPositionInfo({ shouldFetch: false })
  const { data: tokenPrices } = useTokenPrice({
    mintList: Object.values(formattedClmmDataMap)
      .map((pool) => [pool.mintA.address, pool.mintB.address])
      .flat()
  })
  const [selectedPosition, setSelectedPosition] = useState<ClmmPosition | null>(null)

  const handleSelectPosition = useCallback((position: ClmmPosition) => {
    setSelectedPosition(position)
  }, [])

  const allPosition: ClmmPosition[] = useMemo(() => {
    const positionsByPool = Array.from(clmmBalanceInfo.values())
    positionsByPool.sort(
      (a, b) => (formattedClmmDataMap[b[0].poolId.toBase58()]?.tvl || 0) - (formattedClmmDataMap[a[0].poolId.toBase58()]?.tvl || 0)
    )
    positionsByPool.forEach((positions) => {
      positions.sort((a, b) => {
        if (a.liquidity.isZero() && !b.liquidity.isZero()) return 1
        if (b.liquidity.isZero() && !a.liquidity.isZero()) return -1
        return a.tickLower - b.tickLower
      })
    })
    return positionsByPool.flat().filter((p) => p.liquidity.gt(new BN(0)))
  }, [clmmBalanceInfo, formattedClmmDataMap])

  const onLockSuccess = useCallback((val: string) => {
    onNFTOpen()
    setNFTAddress(val || '')
  }, [])

  useEffect(() => {
    if (!allPosition.length) setSelectedPosition(null)
  }, [allPosition.length])

  return (
    <>
      <Grid
        gridTemplate={[
          `
            "back  " auto
            "panel  " minmax(80px, 1fr) / 1fr
          `,
          `
            "back panel  " auto / 1fr minmax(640px, 2fr) 1fr
          `,
          `
            "back panel  . " auto / 1fr minmax(auto, 640px) 1fr
          `
        ]}
        columnGap={[4, '5%']}
        rowGap={[4, '2vh']}
        mt={[2, 8]}
      >
        <GridItem area="back">
          <Flex>
            <HStack
              cursor="pointer"
              onClick={() => {
                routeBack()
              }}
              color={colors.textTertiary}
              fontWeight="500"
              fontSize={['md', 'xl']}
            >
              <ChevronLeftIcon />
              <Text>{t('Back')}</Text>
            </HStack>
          </Flex>
        </GridItem>

        <GridItem area="panel">
          <Flex
            flexDirection="column"
            bg={colors.backgroundLight}
            border={`1px solid ${colors.buttonSolidText}`}
            borderRadius="20px"
            px={[3, 7]}
            py={6}
          >
            <Text
              fontSize={['md', 'xl']}
              fontWeight="medium"
              lineHeight="26px"
              mb={3}
              textAlign={['center', 'start']}
              color={[colors.lightPurple, colors.textPrimary]}
            >
              {t('Burn/Lock Liquidity for CLMM position')}
            </Text>
            <Box color={colors.lightPurple} fontSize={['sm', 'md']} lineHeight="20px" mb={[4, 7]}>
              <Text mb={[4, 7]}>
                {t(
                  'Token teams can permanently lock liquidity. The NFT representing your position is sent to a locked token account. Fees will still be claimable.'
                )}
              </Text>
              <Text mb={[4, 7]}>
                {t(
                  'To start, select a CLMM position below to lock. Ensure that position value and NFT mint  match the position you want to lock!'
                )}
              </Text>
              <Text>{t('Note: Technically, your NFT is not burned but permanently locked.')}</Text>
            </Box>
            <Flex flexDirection="column" gap={3} mb={[4, 7]}>
              {isLoading ? (
                <Flex direction={['column']} gap={3}>
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                </Flex>
              ) : allPosition.length === 0 ? (
                <Box textAlign="center" fontSize="sm" color={colors.lightPurple} bg={colors.backgroundDark} rounded="md" py={7}>
                  {t('You do not currently have any open CLMM positions')}
                </Box>
              ) : (
                allPosition.map((position) => {
                  const positionNft = position.nftMint.toBase58()
                  const poolId = position.poolId.toBase58()
                  const poolInfo = formattedClmmDataMap[poolId]
                  if (!poolInfo || clmmLockInfo[poolId]?.[positionNft]) return null
                  return (
                    <LiquidityItem
                      key={positionNft}
                      position={position}
                      poolInfo={poolInfo}
                      tokenPrices={tokenPrices}
                      isSelected={selectedPosition?.nftMint.toBase58() === positionNft}
                      onClick={() => handleSelectPosition(position)}
                    />
                  )
                })
              )}
            </Flex>
            <Button isDisabled={selectedPosition === null} width="100%" onClick={onOpen}>
              {t('Lock Liquidity')}
            </Button>
          </Flex>
        </GridItem>
      </Grid>
      {selectedPosition && formattedClmmDataMap[selectedPosition.poolId.toBase58()] && (
        <LiquidityLockModal
          isOpen={isOpen}
          onClose={onClose}
          onLockSuccess={onLockSuccess}
          tokenPrices={tokenPrices}
          position={selectedPosition}
          poolInfo={formattedClmmDataMap[selectedPosition.poolId.toBase58()]}
          onRefresh={mutateClmmLockInfo}
        />
      )}
      <LockedNFTModal nftAddress={nftAddress} positionTabValue="concentrated" isOpen={isNFTOpen} onClose={onNFTClose} />
    </>
  )
}
