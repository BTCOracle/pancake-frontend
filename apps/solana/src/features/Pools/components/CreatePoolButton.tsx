import { useCallback } from 'react'
import { Button } from '@pancakeswap/uikit'
import { HStack, useDisclosure } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'

import { Desktop, Mobile } from '@/components/MobileDesktop'
import { CreatePoolEntryDialog } from '@/features/Create/components/CreatePoolEntryDialog'
import PlusIcon from '@/icons/misc/PlusIcon'
import { colors } from '@/theme/cssVariables'
import { logGTMCreateLiquidityPoolEvent } from '@/utils/report/curstomGTMEventTracking'

export type PoolType = 'standard' | 'concentrated'

export default function CreatePoolButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  const handleClick = useCallback(() => {
    logGTMCreateLiquidityPoolEvent()
    onOpen()
  }, [onOpen])

  return (
    <>
      <Mobile>
        <HStack
          width="48px"
          height="48px"
          border={`1px solid ${colors.primary}`}
          bg={colors.primary}
          borderRadius="2xl"
          justifyContent="center"
          onClick={handleClick}
        >
          <PlusIcon strokeWidth={2} width="16px" height="16px" color={colors.backgroundAlt} />
        </HStack>
      </Mobile>
      <Desktop>
        <Button onClick={handleClick} variant="primary" p="18px" scale="md">
          {t('Create')}
        </Button>
      </Desktop>
      <CreatePoolEntryDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
