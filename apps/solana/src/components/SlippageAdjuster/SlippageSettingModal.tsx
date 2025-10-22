import { Flex, HStack, VStack } from '@chakra-ui/react'
import { Box, Button, Message, ModalV2, MotionModal, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import Decimal from 'decimal.js'
import { KeyboardEvent, useCallback, useEffect, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import DecimalInput from '@/components/DecimalInput'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { SWAP_SLIPPAGE_KEY, useSwapStore } from '@/features/Swap/useSwapStore'
import { useEvent } from '@/hooks/useEvent'
import { LIQUIDITY_SLIPPAGE_KEY, useLiquidityStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { setStorageItem } from '@/utils/localStorage'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'

export function SlippageSettingModal(props: { variant: 'swap' | 'liquidity'; isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const isSwap = props.variant === 'swap'
  const SLIPPAGE_KEY = isSwap ? SWAP_SLIPPAGE_KEY : LIQUIDITY_SLIPPAGE_KEY
  const swapSlippage = useSwapStore((s) => s.slippage)
  const liquiditySlippage = useLiquidityStore((s) => s.slippage)
  const slippage = isSwap ? swapSlippage : liquiditySlippage
  const [currentSlippage, setCurrentSlippage] = useState<string>(new Decimal(slippage).mul(100).toFixed())
  const [isFirstFocused, setIsFirstFocused] = useState(false)
  const handleChange = useEvent((val: string | number) => {
    setIsFirstFocused(false)
    setCurrentSlippage(String(val))
  })
  const handleUpdateSlippage = useEvent((val: string | number) => {
    const setVal = Number(val ?? 0) / 100
    setStorageItem(SLIPPAGE_KEY, setVal)
    if (isSwap) {
      useSwapStore.setState({ slippage: setVal }, false, { type: 'SlippageToleranceSettingField' })
    } else {
      useLiquidityStore.setState({ slippage: setVal }, false, { type: 'SlippageToleranceSettingField' })
    }
  })
  const handleBlur = useEvent(() => {
    setIsFirstFocused(false)
    if (!currentSlippage) handleChange(0)
  })
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])
  const handleFocus = useEvent(() => {
    setIsFirstFocused(true)
  })

  const handleSaveFee = useEvent(() => {
    handleUpdateSlippage(currentSlippage || 0)
    props.onClose()
  })

  useEffect(() => {
    setCurrentSlippage(new Decimal(slippage).mul(100).toFixed())
  }, [slippage, props.isOpen])

  const slippageDecimal = new Decimal(currentSlippage || 0)
  const isForerun = slippageDecimal.gt('3')
  const isFailrun = slippageDecimal.lt('0.5')
  const isWarn = isSwap && (isForerun || isFailrun)
  const warnText = isForerun
    ? t('Your transaction may be frontrun and result in an unfavorable trade')
    : isFailrun
    ? t('Your transaction may fail')
    : ''

  const { isMobile } = useMatchBreakpoints()

  return (
    <ModalV2 isOpen={props.isOpen} onDismiss={props.onClose} closeOnOverlayClick>
      <MotionModal
        title={
          <HStack spacing="6px" alignItems="center">
            <Text bold>{isSwap ? t('Swap slippage tolerance') : t('Liquidity slippage tolerance')}</Text>
            <QuestionToolTip
              label={
                isSwap
                  ? t('Set your slippage tolerance for swap transactions.')
                  : t('Set tolerance for changes in the quote/base token deposit ratio.')
              }
              iconProps={{ color: colors.textSecondary }}
            />
          </HStack>
        }
        minWidth={[null, null, '470px']}
        minHeight={isMobile ? null : '240px'}
        headerPadding="24px 24px 0 24px"
        headerBorderColor="transparent"
        onDismiss={props.onClose}
      >
        <VStack gap="24px" alignItems="flex-start">
          <Flex rowGap={2} flexWrap={['wrap', 'unset']} justifyContent="space-between" w="full" alignItems="center">
            <Flex gap="2">
              {(isSwap ? [0.1, 0.5, 1] : [1, 2.5, 3.5]).map((v) => (
                <Button
                  key={v}
                  variant={Number(currentSlippage) === v ? 'primary' : 'tertiary'}
                  onClick={() => {
                    handleChange(v)
                  }}
                >
                  {formatToRawLocaleStr(toPercentString(v))}
                </Button>
              ))}
            </Flex>
            <Flex alignItems="center" rounded="full" gap="10px">
              <Text>{t('Custom')}</Text>
              <DecimalInput
                variant="filledDark"
                value={isFirstFocused ? '' : currentSlippage}
                placeholder={currentSlippage}
                max={50}
                decimals={2}
                onBlur={handleBlur}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                inputSx={{ textAlign: 'center', rounded: '40px', h: '36px', w: '40px', py: 0, px: '2' }}
              />
              <Text>%</Text>
            </Flex>
          </Flex>
          {isWarn ? (
            <Box maxWidth="422px" width="100%">
              <Message mt="2" variant="warning">
                <Text>{warnText}</Text>
              </Message>
            </Box>
          ) : null}
          <Button disabled={Number(currentSlippage) < 0} onClick={handleSaveFee} width="100%">
            {t('Save')}
          </Button>
        </VStack>
      </MotionModal>
    </ModalV2>
  )
}
