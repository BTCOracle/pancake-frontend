import { Box, Button, Flex, Link, Grid, GridItem, HStack, Skeleton, Text, useDisclosure } from '@chakra-ui/react'
import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { ApiV3PoolInfoStandardItemCpmm, CpmmLockExtInfo } from '@pancakeswap/solana-core-sdk'
import BN from 'bn.js'
import { LinkExternal } from '@pancakeswap/uikit'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { colors } from '@/theme/cssVariables/colors'
import { routeBack } from '@/utils/routeTools'
import useLockableCpmmLp from '@/hooks/portfolio/cpmm/useLockableCpmmLp'
import { MintData } from '@/hooks/token/useFetchAccLpMint'
import { useLiquidityStore, useTokenAccountStore } from '@/store'
import LiquidityItem from './components/LiquidityItem'
import LiquidityLockModal from './components/LiquidityLockModal'
import LockedNFTModal from './components/LockedNFTModal'

export default function Lock() {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isNFTOpen, onOpen: onNFTOpen, onClose: onNFTClose } = useDisclosure()
  const lockCpmmLpAct = useLiquidityStore((s) => s.lockCpmmLpAct)
  const [nftAddress, setNFTAddress] = useState('')

  const { data, poolData, isLoading } = useLockableCpmmLp()

  const [selectedPosition, setSelectedPosition] = useState<MintData | null>(null)
  const selectedPoolInfo = poolData.find((p) => p.lpMint.address === selectedPosition?.address.toBase58())

  const handleSelectPosition = useCallback((position: MintData | null) => {
    setSelectedPosition(position)
  }, [])

  const onLockSuccess = useCallback((val: string) => {
    onNFTOpen()
    setNFTAddress(val || '')
  }, [])

  const onLock = useCallback(
    (params: { poolInfo: ApiV3PoolInfoStandardItemCpmm; lpAmount: BN }) => {
      let nftAddress = ''
      lockCpmmLpAct({
        ...params,
        onSent: (info: CpmmLockExtInfo) => {
          nftAddress = info.nftMint.toString()
        },
        onConfirmed: () => {
          onLockSuccess(nftAddress)
          useTokenAccountStore.setState({ refreshCpmmPositionTag: Date.now() })
        }
      })
    },
    [lockCpmmLpAct, onLockSuccess]
  )

  useEffect(() => () => setSelectedPosition(null), [])

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
              textAlign={['center', 'start']}
              color={[colors.lightPurple, colors.textPrimary]}
              fontWeight="medium"
              lineHeight="26px"
              mb={3}
            >
              {t('Burn/Lock Liquidity for standard AMM position')}
            </Text>
            <Box color={colors.lightPurple} fontSize={['sm', 'md']} lineHeight="20px" mb={[4, 7]}>
              <Text mb={[4, 7]}>
                {t(
                  'Token teams can permanently lock liquidity. The LP tokens representing your position is sent to a locked token account. Fees auto-compound to the original position, but remain claimable.'
                )}
              </Text>
              <Text mb={[4, 7]} color={colors.semanticWarning}>
                {t('NOTE: This feature only supports CPMM pools created on the UI. Older V4 pools are not supported at this time.')}
                <LinkExternal href="#">{t('Learn more here.')}</LinkExternal>
              </Text>
              <Text mb={[4, 7]}>
                {t(
                  'To start, select a standard AMM position below to lock. Ensure that position value and LP balance match the position you want to lock!'
                )}
              </Text>
              <Text>{t('Note: Technically, your LP tokens are not burned but permanently locked.')}</Text>
            </Box>
            <Flex flexDirection="column" gap={3} mb={[4, 7]}>
              {isLoading ? (
                <Flex direction={['column']} gap={3}>
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                  <Skeleton borderRadius="8px" height={['150px', '70px']} />
                </Flex>
              ) : data.length === 0 ? (
                <Box textAlign="center" fontSize="sm" color={colors.lightPurple} bg={colors.backgroundDark} rounded="md" py={7}>
                  {t('You do not currently have any open standard AMM positions')}
                </Box>
              ) : (
                data.map((lpMint) => {
                  const poolInfo = poolData.find((p) => p.lpMint.address === lpMint.address.toBase58())
                  if (!poolInfo) return null
                  return (
                    <LiquidityItem
                      key={poolInfo.lpMint.address}
                      poolInfo={poolInfo}
                      isSelected={selectedPosition?.address.toBase58() === poolInfo.lpMint.address}
                      onClick={() => handleSelectPosition(lpMint)}
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
      {selectedPosition && selectedPoolInfo && (
        <LiquidityLockModal isOpen={isOpen} onClose={onClose} onConfirm={onLock} poolInfo={selectedPoolInfo} />
      )}
      <LockedNFTModal nftAddress={nftAddress} positionTabValue="standard" isOpen={isNFTOpen} onClose={onNFTClose} />
    </>
  )
}
