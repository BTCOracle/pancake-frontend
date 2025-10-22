import { TokenInfo, ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, Text, Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { useEvent } from '@/hooks/useEvent'
import { colors } from '@/theme/cssVariables'
import WarningIcon from '@/icons/misc/WarningIcon'

export interface TokenFreezeDialogProps {
  onConfirm: (token: TokenInfo | ApiV3Token) => void
  isOpen: boolean
  onClose: () => void
  token: TokenInfo | ApiV3Token
}

export default function TokenFreezeDialog({ onConfirm, isOpen, onClose, token }: TokenFreezeDialogProps) {
  const { t } = useTranslation()

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
              {t('Freeze Authority Warning')}
            </Text>
            <Text fontWeight="bold" fontSize="md" color={colors.semanticWarning} pt={5}>
              {t('This token has freeze authority enabled and could prevent you from transferring or trading the token later.')}
            </Text>
            <Button
              width="full"
              mt={5}
              borderRadius={12}
              onClick={() => {
                onConfirm(token)
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
