import { Button } from '@pancakeswap/uikit'
import { Flex, Text, HStack, Spacer } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { KeyboardEvent, useCallback, useState } from 'react'
import Decimal from 'decimal.js'
import DecimalInput from '@/components/DecimalInput'
import Close from '@/icons/misc/Close'
import { useEvent } from '@/hooks/useEvent'
import { useLiquidityStore, LIQUIDITY_SLIPPAGE_KEY } from '@/store'
import { useSwapStore, SWAP_SLIPPAGE_KEY } from '@/features/Swap/useSwapStore'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { setStorageItem } from '@/utils/localStorage'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import PanelCard from '../PanelCard'

export function SlippageSettingField({ variant = 'liquidity', onClose }: { variant?: 'swap' | 'liquidity'; onClose?: () => void }) {
  const { t } = useTranslation()
  const isSwap = variant === 'swap'
  const SLIPPAGE_KEY = isSwap ? SWAP_SLIPPAGE_KEY : LIQUIDITY_SLIPPAGE_KEY
  const swapSlippage = useSwapStore((s) => s.slippage)
  const liquiditySlippage = useLiquidityStore((s) => s.slippage)
  const slippage = isSwap ? swapSlippage : liquiditySlippage
  const [currentSlippage, setCurrentSlippage] = useState(new Decimal(slippage).mul(100).toFixed())
  const [isFirstFocused, setIsFirstFocused] = useState(false)
  const slippageDecimal = new Decimal(currentSlippage || 0)
  const isForerun = slippageDecimal.gt('3')
  const isFailrun = slippageDecimal.lt('0.5')
  const isWarn = isSwap && (isForerun || isFailrun)
  const warnText = isForerun
    ? t('Your transaction may be frontrun and result in an unfavorable trade')
    : isFailrun
    ? t('Your transaction may fail')
    : ''
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
    handleUpdateSlippage(currentSlippage || 0)
  })
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])
  const handleFocus = useEvent(() => {
    setIsFirstFocused(true)
  })

  return (
    <PanelCard flexDirection="column" gap="4" my="2" p="4" rounded="xl">
      <HStack alignItems="center" flexWrap={['wrap', 'nowrap']}>
        <Text variant="subTitle">{isSwap ? t('Swap slippage tolerance') : t('Liquidity slippage tolerance')}</Text>
        <QuestionToolTip
          label={
            isSwap
              ? t('Set your slippage tolerance for swap transactions.')
              : t('Set tolerance for changes in the quote/base token deposit ratio.')
          }
          iconProps={{ color: colors.textSubtle }}
        />
        <Spacer />
        <Close style={{ cursor: 'pointer' }} width={12} height={12} color={colors.textSubtle} onClick={onClose} />
      </HStack>
      <Flex rowGap={2} flexWrap={['wrap', 'unset']} justifyContent="space-between">
        <Flex gap="2">
          {(isSwap ? [0.1, 0.5, 1] : [1, 2.5, 3.5]).map((v) => (
            <Button
              key={v}
              scale="sm"
              borderRadius="12px"
              border={`1px solid ${Number((slippage * 100).toFixed(1)) === v ? colors.primary60 : colors.tertiary}`}
              variant="primary60"
              onClick={() => {
                handleChange(v)
                handleUpdateSlippage(v)
              }}
            >
              {formatToRawLocaleStr(toPercentString(v))}
            </Button>
          ))}
        </Flex>
        <Flex alignItems="center" rounded="full" gap={2}>
          <Text fontSize="xs" whiteSpace="nowrap" color={colors.textSubtle}>
            {t('Custom')}
          </Text>
          <DecimalInput
            value={isFirstFocused ? '' : currentSlippage}
            placeholder={currentSlippage}
            max={50}
            decimals={2}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            inputSx={{ textAlign: 'right', rounded: '40px', h: '32px', w: '25px', py: 0, px: '0' }}
          />
          <Text fontSize="xs" color={colors.textSubtle}>
            %
          </Text>
        </Flex>
      </Flex>
      {isWarn ? (
        <Text fontSize="sm" color={colors.semanticWarning}>
          {warnText}
        </Text>
      ) : null}
    </PanelCard>
  )
}
