import { Flex } from '@chakra-ui/react'
import { Button, Text } from '@pancakeswap/uikit'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useRef, useState } from 'react'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import { useEvent } from '@/hooks/useEvent'
import useResponsive from '@/hooks/useResponsive'
import PriorityFastIcon from '@/icons/misc/PriorityFastIcon'
import PriorityFixIcon from '@/icons/misc/PriorityFixIcon'
import PriorityTurboIcon from '@/icons/misc/PriorityTurboIcon'
import PriorityUltraIcon from '@/icons/misc/PriorityUltraIcon'
import { FEE_KEY, PriorityLevel, PriorityMode, useAppStore } from '@/store/useAppStore'
import { colors } from '@/theme/cssVariables'
import { setStorageItem } from '@/utils/localStorage'
import { PriorityModalContent } from './PriorityModalContent'

export function PriorityButton() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const { isMobile, isTablet } = useResponsive()
  const { connected } = useWallet()
  const transactionFee = useAppStore((s) => s.transactionFee)
  const feeConfig = useAppStore((s) => s.feeConfig)
  const priorityLevel = useAppStore((s) => s.priorityLevel)
  const priorityMode = useAppStore((s) => s.priorityMode)
  const isExact = priorityMode === PriorityMode.Exact

  const triggerRef = useRef<HTMLDivElement>(null)
  const [currentFee, setCurrentFee] = useState<string | undefined>()
  const feeWarn = Number(currentFee) <= (feeConfig[0] ?? 0)
  const handleChangeFee = useEvent((val?: string) => {
    setCurrentFee(val)
  })
  const handleSaveFee = useEvent(() => {
    setStorageItem(FEE_KEY, currentFee === undefined ? '' : String(currentFee))
    useAppStore.setState({ transactionFee: currentFee })
    onClose()
  })

  useEffect(() => {
    setCurrentFee(transactionFee)
  }, [transactionFee, isOpen])

  const PriorityIcon = () => {
    if (isExact) {
      return <PriorityFixIcon />
    }

    switch (priorityLevel) {
      case PriorityLevel.Fast:
        return <PriorityFastIcon />
      case PriorityLevel.Turbo:
        return <PriorityTurboIcon />
      case PriorityLevel.Ultra:
        return <PriorityUltraIcon />
      default:
        return null
    }
  }

  return (
    <>
      <Flex align="center" onClick={() => onOpen()} ref={triggerRef}>
        {isMobile || isTablet ? (
          connected && (
            <Flex color={colors.textSubtle} cursor="pointer">
              <PriorityIcon />
            </Flex>
          )
        ) : (
          <Button scale="sm" variant="tertiary">
            <Text color="primary" bold>
              {' '}
              Priority: {isExact ? `${transactionFee} SOL` : PriorityLevel[priorityLevel]}
            </Text>
          </Button>
        )}
      </Flex>
      <PriorityModalContent
        isOpen={isOpen}
        triggerRef={triggerRef}
        onClose={onClose}
        currentFee={currentFee}
        onChangeFee={handleChangeFee}
        onSaveFee={handleSaveFee}
      />
    </>
  )
}
