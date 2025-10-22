import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  Flex,
  HStack,
  Input
} from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { colors } from '@/theme/cssVariables'
import TokenAvatar from '@/components/TokenAvatar'
import InfoCircleIcon from '@/icons/misc/InfoCircleIcon'
import WarningIcon from '@/icons/misc/WarningIcon'
import { shortenAddress, getMintSymbol } from '@/utils/token'
import { formatCurrency } from '@/utils/numberish/formatter'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { useClmmStore } from '@/store'

function LiquidityLockModal({
  isOpen,
  onClose,
  onLockSuccess,
  onRefresh,
  poolInfo,
  position,
  tokenPrices
}: {
  isOpen: boolean
  onClose: () => void
  onLockSuccess: (val: string) => void
  onRefresh: () => void
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
  tokenPrices: Record<string, TokenPrice>
}) {
  const { t } = useTranslation()
  const lockPositionAct = useClmmStore((s) => s.lockPositionAct)
  const { getPriceAndAmount } = useClmmBalance({})
  const { amountA, amountB } = getPriceAndAmount({ poolInfo, position })

  const [confirmText, setConfirmText] = useState('')

  const handleCloseModal = () => {
    setConfirmText('')
    onClose()
  }

  const poolNft = position.nftMint.toBase58()
  const { poolName } = poolInfo

  const mintAValue = amountA.mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
  const mintBValue = amountB.mul(tokenPrices[poolInfo.mintB.address]?.value || 0)
  const positionAmount = mintAValue.add(mintBValue)

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} size={{ base: 'md', md: 'xl' }}>
      <ModalOverlay />
      <ModalContent bg={colors.backgroundLight} border={`1px solid ${colors.buttonSolidText}`} p={{ base: 4, md: 8 }}>
        <Flex flexDirection="column" justifyContent="center" alignItems="center" gap={5} mt={2}>
          <InfoCircleIcon width={32} height={32} color={colors.textPink} />
          <Text fontSize={['lg', 'xl']} fontWeight="medium">
            {t('Lock Liquidity Permanently?')}
          </Text>
        </Flex>
        <ModalCloseButton />
        <ModalBody mt={[5, 6]}>
          <Text color={colors.lightPurple} lineHeight="20px" fontSize={['sm', 'md']}>
            {t(
              'Are you sure you want to permanently lock/burn liquidity? You will be unable to access or withdraw underlying position assets, only trading fees earned will remain claimable.'
            )}
          </Text>
          <Box
            rounded="xl"
            border={`1px solid ${colors.selectInactive}`}
            bg={colors.modalContainerBg}
            px={5}
            py={3}
            my={[4, 6]}
            mx={[0, 0, 16]}
          >
            <Flex alignItems="center" gap={1} justifyContent="space-between" fontSize={['sm', 'md']} color={colors.lightPurple} mb={[1, 2]}>
              <Text>
                {poolName} {t(' position NFT:')}
              </Text>
              <Text>{shortenAddress(poolNft, 5)}</Text>
            </Flex>
            <Flex alignItems="center" gap={1} justifyContent="space-between" fontSize={['sm', 'md']} color={colors.lightPurple} mb={[1, 2]}>
              <Text>{t('Position')}: </Text>
              <Text>
                {formatCurrency(positionAmount, {
                  symbol: '$',
                  abbreviated: true,
                  decimalPlaces: 2
                })}
              </Text>
            </Flex>
            <Flex alignItems="center" gap={1} justifyContent="space-between" fontSize={['xs', 'sm']} mb={[1, 3]}>
              <HStack gap={1}>
                <TokenAvatar size="sm" token={poolInfo.mintA} />
                <Text color={colors.textPrimary}>
                  {formatCurrency(amountA, {
                    abbreviated: true,
                    decimalPlaces: 2
                  })}
                </Text>
                <Text color={colors.lightPurple}>{getMintSymbol({ mint: poolInfo.mintA, transformSol: true })}</Text>
              </HStack>
              <Text color={colors.textPrimary}>
                {formatCurrency(mintAValue, {
                  symbol: '$',
                  abbreviated: true,
                  decimalPlaces: 2
                })}
              </Text>
            </Flex>
            <Flex alignItems="center" gap={1} justifyContent="space-between" fontSize={['xs', 'sm']}>
              <HStack gap={1}>
                <TokenAvatar size="sm" token={poolInfo.mintB} />
                <Text color={colors.textPrimary}>
                  {formatCurrency(amountB, {
                    abbreviated: true,
                    decimalPlaces: 2
                  })}
                </Text>
                <Text color={colors.lightPurple}>{getMintSymbol({ mint: poolInfo.mintB, transformSol: true })}</Text>
              </HStack>
              <Text color={colors.textPrimary}>
                {formatCurrency(mintBValue, {
                  symbol: '$',
                  abbreviated: true,
                  decimalPlaces: 2
                })}
              </Text>
            </Flex>
          </Box>
          <Flex rounded="lg" bg={colors.background03} py={3} px={4} gap={3}>
            <Text pt={0.5}>
              <WarningIcon stroke={colors.textPink} width="16" height="16" />
            </Text>
            <Text color={colors.textPink} fontSize="sm" fontWeight="medium">
              {t(
                'By confirming below, I agree to permanently lock liquidity. I understand access to the underlying assets will be lost forever.'
              )}
            </Text>
          </Flex>
          <Flex
            flexDirection="column"
            alignItems={['flex-start', 'center']}
            rounded="xl"
            bg={colors.modalContainerBg}
            border={`1px solid ${colors.selectInactive}`}
            px={7}
            py={4}
            gap={2}
            mt={[4, 6]}
            fontSize={['sm', 'md']}
          >
            <Text color={colors.lightPurple}>{t('To confirm, type the following:')}</Text>
            <Text color={colors.lightPurple} fontWeight="medium" userSelect="none">
              {t('I confirm, permanently lock my liquidity forever')}
            </Text>
            <Input
              variant="filledDark"
              w="full"
              rounded="lg"
              color={colors.lightPurple}
              fontWeight="medium"
              textAlign="center"
              sx={{
                _placeholder: {
                  textAlign: 'center'
                }
              }}
              onChange={(e) => setConfirmText(e.currentTarget.value)}
              placeholder={t('Type confirmation text here') || ''}
            />
          </Flex>
        </ModalBody>
        <ModalFooter mt={[4, 8]} flexDirection="column" gap="2">
          <Button
            variant="danger"
            w="full"
            loadingText={`${t('Lock Liquidity')}...`}
            isDisabled={confirmText !== t('I confirm, permanently lock my liquidity forever')}
            onClick={() => {
              let nftAddress = ''
              lockPositionAct({
                poolInfo,
                position,
                onSent: (address) => {
                  nftAddress = address.lockNftMint.toBase58()
                  return nftAddress
                },
                onConfirmed: () => {
                  handleCloseModal()
                  onLockSuccess(nftAddress)
                }
              })
            }}
          >
            {t('Confirm, Lock Liquidity Permanently')}
          </Button>
          <Button w="full" variant="ghost" fontSize="sm" color={colors.buttonPrimary} onClick={handleCloseModal}>
            {t('Cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LiquidityLockModal
