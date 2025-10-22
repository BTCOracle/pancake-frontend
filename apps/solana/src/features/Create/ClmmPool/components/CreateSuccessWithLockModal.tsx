import { Modal, ModalOverlay, ModalContent, ModalFooter, ModalBody, Flex, Text } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { routeToPage } from '@/utils/routeTools'
import Button from '@/components/Button'
import { colors } from '@/theme/cssVariables'
import CircleCheck from '@/icons/misc/CircleCheck'

export default function CreateSuccessWithLockModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody p="4">
          <Flex flexDirection="column" alignItems="center">
            <CircleCheck width={32} height={32} color={colors.secondary} />
            <Text variant="dialogTitle" mt="4" mb="2" textAlign="center">
              {t('Pool and position created successfully')}
            </Text>
            <Text color={colors.lightPurple} textAlign="center">
              {t(
                'Your Pool will appear in the Pool List within approximately 5 minutes, and you can also view your added position under the My Position tab. This pool is represented by an NFT—please do not burn or transfer it, as it is required to retain ownership of the position.'
              )}
            </Text>
          </Flex>
        </ModalBody>
        <ModalFooter flexDirection="column" gap="2">
          <Button w="100%" onClick={() => routeToPage('pools')}>
            {t('Got it')}
          </Button>
          <Button variant="ghost" w="100%" fontSize="sm" onClick={() => routeToPage('positions')}>
            {t('View my positions')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
