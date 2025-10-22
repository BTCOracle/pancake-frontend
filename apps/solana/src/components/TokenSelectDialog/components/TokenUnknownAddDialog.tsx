import { TokenInfo, ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, Text, Box, Button, Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { useEvent } from '@/hooks/useEvent'
import { colors } from '@/theme/cssVariables'
import WarningIcon from '@/icons/misc/WarningIcon'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'
import { getStorageToken } from '@/store/useTokenStore'

export interface TokenUnknownAddDialogProps {
  onConfirm: (token: TokenInfo | ApiV3Token) => void
  isOpen: boolean
  onClose: () => void
  token: TokenInfo | ApiV3Token
}

export default function TokenUnknownAddDialog({ onConfirm, isOpen, onClose, token }: TokenUnknownAddDialogProps) {
  const { t } = useTranslation()
  const cacheInfo = getStorageToken(token.address)

  const tokenInfo = {
    ...token,
    ...(cacheInfo
      ? {
          symbol: cacheInfo.symbol,
          name: cacheInfo.name
        }
      : {})
  }

  const handleClose = useEvent(() => {
    onClose()
  })
  return (
    <Modal variant="mobileFullPage" isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody display="flex" flexDirection="column" overflowX="hidden">
          <Flex
            height={['auto', '30vh']}
            flex="1"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            pt={3.5}
            px={6}
            maxW="100%"
            overflow="hidden"
          >
            <WarningIcon width="27" height="27" />
            <Text fontWeight="bold" fontSize="xl" pt={3}>
              {t('Confirm Token')}
            </Text>
            <Text fontWeight="bold" fontSize="md" color={colors.semanticWarning} pt={5}>
              {t('This token is not on the default token lists.')}
            </Text>
            <Text fontWeight="normal" fontSize="md" color={colors.textSecondary} pt={2}>
              {t('By clicking below, you understand that you are fully responsible for confirming the token you are trading.')}
            </Text>
            <Flex
              w="full"
              borderRadius={4}
              mt={5}
              background={colors.backgroundDark}
              px={4}
              py={4}
              alignItems="center"
              justifyContent="space-between"
            >
              <TokenAvatar token={tokenInfo} />
              <Text color={colors.textSecondary}>{tokenInfo?.symbol}</Text>
              <Box color={colors.textSecondary} textAlign="right">
                <AddressChip
                  onClick={(ev) => ev.stopPropagation()}
                  color={colors.textTertiary}
                  canExternalLink
                  fontSize="xs"
                  address={tokenInfo?.address}
                />
              </Box>
            </Flex>
            <Button
              width="full"
              mt={5}
              borderRadius={12}
              onClick={() => {
                onConfirm(tokenInfo)
              }}
            >
              {t('I understand, confirm')}
            </Button>
            <Text
              mt={4}
              fontWeight="bold"
              fontSize="xs"
              color={colors.textSecondary}
              cursor="pointer"
              onClick={() => {
                onClose()
              }}
            >
              {t('Cancel')}
            </Text>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
