import { Collapse, Divider, Flex, HStack, VStack } from '@chakra-ui/react'
import { Button, ButtonMenu, ButtonMenuItem, ModalV2, MotionModal, Text } from '@pancakeswap/uikit'
import { SOLMint } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import DecimalInput from '@/components/DecimalInput'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import WarningIcon from '@/icons/misc/WarningIcon'
import { PRIORITY_LEVEL_KEY, PRIORITY_MODE_KEY, PriorityLevel, PriorityMode, useAppStore } from '@/store/useAppStore'
import { colors } from '@/theme/cssVariables'
import { setStorageItem } from '@/utils/localStorage'
import { formatCurrency } from '@/utils/numberish/formatter'

export function PriorityModalContent(props: {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLDivElement>
  currentFee: string | undefined
  onChangeFee: (val: string) => void
  onSaveFee: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerPanelGap = 24
  const isMobile = useAppStore((s) => s.isMobile)

  const feeConfig = useAppStore((s) => s.feeConfig)
  const appPriorityLevel = useAppStore((s) => s.priorityLevel)
  const appPriorityMode = useAppStore((s) => s.priorityMode)

  const getTriggerRect = () => props.triggerRef.current?.getBoundingClientRect()
  const { currentFee, onChangeFee, onSaveFee, isOpen } = props
  const feeWarn = Number(currentFee) <= (feeConfig[0] ?? 0)

  const [priorityMode, setPriorityMode] = useState(PriorityMode.MaxCap)
  const [priorityLevel, setPriorityLevel] = useState(PriorityLevel.Turbo)

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])

  const handlePriorityLevelChange = useCallback((index: number) => {
    setPriorityLevel(index)
  }, [])
  const handlePriorityModeChange = useCallback((index: number) => {
    setPriorityMode(index)
  }, [])

  const handleSave = useEvent(() => {
    setStorageItem(PRIORITY_LEVEL_KEY, priorityLevel)
    setStorageItem(PRIORITY_MODE_KEY, priorityMode)
    useAppStore.setState({
      priorityLevel,
      priorityMode
    })
    onSaveFee()
  })

  const { data: tokenPrice } = useTokenPrice({
    mintList: [SOLMint.toBase58()]
  })
  const price = tokenPrice[SOLMint.toBase58()]?.value
  const totalPrice = price && currentFee ? new Decimal(price ?? 0).mul(currentFee).toString() : ''

  useEffect(() => {
    setPriorityLevel(appPriorityLevel)
    setPriorityMode(appPriorityMode)
  }, [appPriorityLevel, appPriorityMode, isOpen])

  return (
    <ModalV2 isOpen={props.isOpen} onDismiss={props.onClose} closeOnOverlayClick>
      <MotionModal
        title={
          <HStack spacing="6px" alignItems="center">
            <Text bold fontSize="24px">
              {t('Transaction Priority Fee')}
            </Text>
            <QuestionToolTip
              label={t(
                'The priority fee is paid to the Solana network. This additional fee boosts transaction prioritization, resulting in faster execution times. Note that the fee is taken even if a transaction ultimately fails.'
              )}
              iconProps={{ color: colors.textSecondary }}
            />
          </HStack>
        }
        minWidth={[null, null, null, '480px']}
        minHeight={isMobile ? '500px' : '240px'}
        maxWidth={[null, null, null, '480px']}
        headerPadding="16px 24px 0 24px"
        bodyPadding="0 24px 24px"
        headerBorderColor="transparent"
        onDismiss={props.onClose}
      >
        <VStack gap={4}>
          <Text fontSize="14px">{t('Fee settings are applied across all PancakeSwap features, including Swap, Liquidity.')}</Text>
          <Divider />
          <Collapse in={priorityMode === 0} animateOpacity style={{ width: '100%' }}>
            <VStack width="full" align="flex-start">
              <Text fontSize="14px">{t('Priority Level')}</Text>
              <ButtonMenu scale="sm" variant="subtle" onItemClick={handlePriorityLevelChange} activeIndex={priorityLevel} fullWidth>
                <ButtonMenuItem height="40px"> {t('Fast')} </ButtonMenuItem>
                <ButtonMenuItem height="40px"> {t('Turbo')} </ButtonMenuItem>
                <ButtonMenuItem height="40px"> {t('Ultra')} </ButtonMenuItem>
              </ButtonMenu>
            </VStack>
          </Collapse>
          <VStack width="full" align="stretch" gap={3}>
            <Flex justify="space-between" align="center">
              <Text fontSize="14px">{t('Priority Mode')}</Text>

              <ButtonMenu scale="sm" variant="subtle" onItemClick={handlePriorityModeChange} activeIndex={priorityMode}>
                <ButtonMenuItem height="40px"> {t('Max Cap')} </ButtonMenuItem>
                <ButtonMenuItem height="40px"> {t('Exact Fee')} </ButtonMenuItem>
              </ButtonMenu>
            </Flex>
            <Text fontSize="14px" color="textSubtle">
              {priorityMode === 0
                ? t('PancakeSwap auto-optimizes priority fees for your transaction. Set a max cap to prevent overpaying.')
                : t('Transactions will use the exact fee set below.')}
            </Text>
            <Flex justify="space-between">
              <Text fontSize="14px">{priorityMode === 0 ? t('Set Max Cap') : t('Exact Fee')}</Text>
              <Text fontSize="14px" color="textSubtle">
                {`~${formatCurrency(totalPrice, { symbol: '$', decimalPlaces: 2 })}`}
              </Text>
            </Flex>
            <DecimalInput
              postFixInField
              width="100%"
              value={currentFee === undefined ? '' : String(currentFee)}
              placeholder={t('Enter custom value') ?? undefined}
              onChange={onChangeFee}
              onKeyDown={handleKeyDown}
              inputGroupSx={{ alignItems: 'center' }}
              postfix={<Text>SOL</Text>}
            />
          </VStack>
          {feeWarn && (
            <Flex
              px={4}
              py={2}
              bg={colors.warnButtonLightBg}
              color={colors.semanticWarning}
              fontSize="sm"
              fontWeight="medium"
              borderRadius="8px"
              w="full"
            >
              <Text pt={0.5}>
                <WarningIcon />
              </Text>
              <Text pl={2}>{t('Your current max fee is below market rate. Increase it to ensure your transactions are processed.')}</Text>
            </Flex>
          )}
          <Divider />
          <Button width="100%" variant="primary" disabled={Number(currentFee) <= 0} onClick={handleSave}>
            {t('Save')}
          </Button>
        </VStack>
      </MotionModal>
    </ModalV2>
  )
}
