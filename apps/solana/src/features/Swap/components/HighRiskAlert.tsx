import { HStack, VStack } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { ModalV2, MotionModal, useMatchBreakpoints, Text, Button, Flex, Box, Input } from '@pancakeswap/uikit'
import { useState } from 'react'
import { colors } from '@/theme/cssVariables'

export default function HighRiskAlert({
  isOpen,
  percent,
  onClose,
  onConfirm
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  percent: number
}) {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const [confirm, setConfirm] = useState('')

  const handleConfirm = () => {
    if (confirm === 'confirm') {
      onConfirm()
    }
  }

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onClose} closeOnOverlayClick>
      <MotionModal
        title={t('High Price Impact Warning')}
        onDismiss={onClose}
        minWidth={[null, null, '370px']}
        maxWidth={['100%', '100%', '100%', '370px']}
        minHeight={isMobile ? '400px' : undefined}
        headerPadding="2px 14px 0 24px"
      >
        {percent < 10 ? (
          <VStack spacing={6}>
            <Text fontSize="md" fontWeight="400" color={colors.textPrimary}>
              {t('Price impact for this swap is %percent%', { percent: `${percent.toFixed(2)}%` })}
              <br />
              {t('Confirming may result in a poor price for this swap!')}
            </Text>

            <VStack width="full" spacing={2}>
              <Button width="100%" onClick={onClose}>
                {t('Cancel')}
              </Button>
              <Button width="100%" variant="secondary" onClick={onConfirm}>
                {t('Swap Anyway')}
              </Button>
            </VStack>
          </VStack>
        ) : (
          <VStack spacing={6}>
            <Text fontSize="md" fontWeight="400" color={colors.textPrimary}>
              {t('Price impact for this swap is %percent%', { percent: `${percent.toFixed(2)}%` })}
              <br />
              {t('Please type the word "confirm" to continue with this swap.')}
            </Text>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} />

            <HStack width="full" spacing={2} justifyContent="flex-end">
              <Button variant="secondary" onClick={onClose}>
                {t('Cancel')}
              </Button>
              <Button variant="primary" onClick={handleConfirm}>
                {t('OK')}
              </Button>
            </HStack>
          </VStack>
        )}
      </MotionModal>
    </ModalV2>
  )
}
