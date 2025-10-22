import { Text, Button, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalFooter } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useTranslation } from '@pancakeswap/localization'
import { routeToPage } from '@/utils/routeTools'

export default function StakeLpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Modal size="md" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent sx={{ bg: 'rgba(28, 36, 62, 1)' }}>
        <ModalHeader textAlign="center" px="12" mb="5" fontSize="xl">
          {t('Do you want to stake your LP now?')}
        </ModalHeader>
        <ModalBody textAlign="center">
          <Text variant="title" fontSize="md" mb="6" fontWeight="400">
            {t('Stake LP tokens to a farm to earn additional rewards. You can also do it later under Portfolio.')}
          </Text>
        </ModalBody>
        <ModalFooter flexDirection="column" gap="2" px="0" py="0" mt="4">
          <Button
            onClick={() => {
              routeToPage('increase-liquidity', {
                queryProps: {
                  mode: 'stake',
                  pool_id: router.query.pool_id as string
                }
              })
            }}
            w="100%"
          >
            {t('Stake')}
          </Button>
          <Button variant="ghost" onClick={onClose} w="100%">
            {t('Not Now')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
