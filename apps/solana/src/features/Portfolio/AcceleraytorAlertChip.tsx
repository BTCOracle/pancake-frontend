import { HStack, Text, useDisclosure } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { useEffect } from 'react'
import useFetchOwnerIdo from '@/hooks/portfolio/useFetchOwnerIdo'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { AlertChip } from '../../components/AlertChip'

export function AcceleraytorAlertChip() {
  const { t } = useTranslation()
  const publicKey = useAppStore((s) => s.publicKey)
  const idoInfo = useFetchOwnerIdo({
    owner: publicKey?.toString()
  })
  const { isOpen, onClose, onOpen } = useDisclosure({ defaultIsOpen: idoInfo.formattedData.length > 0 })
  useEffect(() => {
    if (idoInfo.formattedData.length > 0) {
      onOpen()
    } else {
      onClose()
    }
  }, [idoInfo.formattedData])
  return (
    <AlertChip
      isOpen={isOpen}
      onClose={onClose}
      alertContent={
        <HStack>
          <Text>
            {t('You have unclaimed funds in AcceleRaytor. Check details at the bottom of this page and claim funds with one click.')}
          </Text>
          <Text color={colors.textLink} cursor="pointer" onClick={() => scrollToHeading('acceleraytor')}>
            {t('Go>>')}
          </Text>
        </HStack>
      }
    />
  )
}

/**
 * DOM utils
 */
function scrollToHeading(id: string) {
  const element = document.getElementById(id)
  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
