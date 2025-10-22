import { Button } from '@pancakeswap/uikit'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalContentProps,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  SystemStyleObject,
  VStack
} from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'

import { colors } from '@/theme/cssVariables'

import { Desktop, Mobile } from './MobileDesktop'

type ResponsiveModalProps = ModalProps & {
  title?: string | null
  confirmText?: string
  onConfirm?: () => void
  cancelText?: string
  hasSecondaryButton?: boolean
  footerSX?: SystemStyleObject
  showFooter?: boolean
  closeOnClickConfirmButton?: boolean
  propOfModalContent?: ModalContentProps
}

/**
 * used for desktop: Modal; mobile: Drawer
 */
export default function ResponsiveModal({
  title,
  confirmText,
  cancelText,
  isOpen,
  onClose,
  onConfirm,
  children,
  footerSX = {},
  hasSecondaryButton = true,
  showFooter = false,
  closeOnClickConfirmButton = true,
  propOfModalContent,
  ...rest
}: ResponsiveModalProps) {
  const { t } = useTranslation()
  return (
    <>
      <Desktop>
        <Modal {...rest} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent {...propOfModalContent}>
            <ModalHeader color={colors.textPrimary} fontWeight={600} fontSize="xl" mt={2}>
              {title}
            </ModalHeader>
            <ModalCloseButton size="lg" color={colors.textSubtle} />
            <ModalBody>{children}</ModalBody>

            {showFooter && (
              <ModalFooter mt={4}>
                <VStack w="full" sx={footerSX}>
                  <Button
                    width="100%"
                    onClick={() => {
                      onConfirm?.()
                      if (closeOnClickConfirmButton) onClose?.()
                    }}
                  >
                    {confirmText ?? t('Confirm')}
                  </Button>
                  {hasSecondaryButton && (
                    <Button width="100%" variant="text" color={colors.textSeptenary} onClick={onClose}>
                      {cancelText ?? t('Cancel')}
                    </Button>
                  )}
                </VStack>
              </ModalFooter>
            )}
          </ModalContent>
        </Modal>
      </Desktop>
      <Mobile>
        <Drawer {...rest} isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>{title}</DrawerHeader>
            <DrawerBody>{children}</DrawerBody>
            {showFooter && (
              <DrawerFooter py={4}>
                <VStack w="full">
                  <Button
                    width="100%"
                    onClick={() => {
                      onConfirm?.()
                      if (closeOnClickConfirmButton) onClose?.()
                    }}
                  >
                    {confirmText ?? t('Confirm')}
                  </Button>
                  {hasSecondaryButton && (
                    <Button width="100%" variant="text" color={colors.textSeptenary} onClick={onClose}>
                      {cancelText ?? t('Cancel')}
                    </Button>
                  )}
                </VStack>
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      </Mobile>
    </>
  )
}
