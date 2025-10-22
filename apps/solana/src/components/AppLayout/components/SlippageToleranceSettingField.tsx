import { Flex } from '@chakra-ui/react'
import { Box, Button, ButtonMenu, ButtonMenuItem, Input, Message, Text } from '@pancakeswap/uikit'
import Decimal from 'decimal.js'
import { KeyboardEvent, useCallback, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { SWAP_SLIPPAGE_KEY, useSwapStore } from '@/features/Swap/useSwapStore'
import { useEvent } from '@/hooks/useEvent'
import { LIQUIDITY_SLIPPAGE_KEY, useAppStore, useLiquidityStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { escapeRegExp, inputRegex } from '@/utils/escapeRegExp'
import { setStorageItem } from '@/utils/localStorage'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { SettingField } from './SettingField'
import { SettingFieldToggleButton } from './SettingFieldToggleButton'

export const VerticalDivider = styled.span.withConfig({
  shouldForwardProp: (prop) => !['bg', 'height', 'width'].includes(prop)
})<{
  bg?: string
  height?: string
  width?: string
}>`
  background: ${colors.inputSecondary};
  width: ${({ width }) => width || '1px'};
  height: ${({ height }) => height || '20px'};
  margin: 0 4px;
`

export function SlippageToleranceSettingField({ variant = 'swap' }: { variant?: 'swap' | 'liquidity' }) {
  const { t } = useTranslation()
  const isSwap = variant === 'swap'
  const SLIPPAGE_KEY = isSwap ? SWAP_SLIPPAGE_KEY : LIQUIDITY_SLIPPAGE_KEY
  const swapSlippage = useSwapStore((s) => s.slippage)
  const liquiditySlippage = useLiquidityStore((s) => s.slippage)
  const slippage = isSwap ? swapSlippage : liquiditySlippage
  const isMobile = useAppStore((s) => s.isMobile)
  const [currentSlippage, setCurrentSlippage] = useState(new Decimal(slippage).mul(100).toFixed())
  const [isFirstFocused, setIsFirstFocused] = useState(false)
  const handleChange = useEvent((val: string) => {
    if (val === '' || inputRegex.test(escapeRegExp(val))) {
      setIsFirstFocused(!val)
      setCurrentSlippage(val)
    }
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
    if (!currentSlippage) handleChange('0')
    const value = Number(currentSlippage) > 50 ? 50 : currentSlippage
    if (Number(currentSlippage) > 50) {
      setCurrentSlippage('50')
    }
    handleUpdateSlippage(value || 0)
  })
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
    }
  }, [])
  const handleFocus = useEvent(() => {
    setIsFirstFocused(true)
  })
  const slippageList = isSwap ? [0.1, 0.5, 1] : [1, 2.5, 3.5]

  return (
    <SettingField
      fieldName={isSwap ? t('Swap slippage tolerance') : t('Liquidity slippage tolerance')}
      isCollapseDefaultOpen
      tooltip={
        isSwap
          ? t('Set your slippage tolerance for swap transactions.')
          : t('Set tolerance for changes in the quote/base token deposit ratio.')
      }
      renderToggleButton={
        isMobile
          ? (isOpen) => <SettingFieldToggleButton isOpen={isOpen} renderContent={`${new Decimal(slippage).mul(100).toFixed()}%`} />
          : null
      }
      renderWidgetContent={
        <>
          <Flex rowGap={2} flexWrap={['wrap', 'unset']} justifyContent="space-between">
            <ButtonMenu
              paddingX="2px"
              style={{ borderRadius: '30px' }}
              activeIndex={slippageList.findIndex((v) => new Decimal(slippage).mul(100).eq(v))}
              onItemClick={(index) => {
                const value = slippageList[index]
                handleChange(String(value))
                handleUpdateSlippage(value)
              }}
              scale="sm"
            >
              {slippageList.map((v) => (
                <ButtonMenuItem key={v}>{formatToRawLocaleStr(toPercentString(v))}</ButtonMenuItem>
              ))}
            </ButtonMenu>
            <Flex alignItems="center" rounded="full">
              <Text fontSize={14} mr="10px">
                {t('Custom')}
              </Text>
              <Flex alignItems="center">
                <Box position="relative" width="82px">
                  <Input
                    scale="md"
                    inputMode="decimal"
                    pattern="^[0-9]*[.,]?[0-9]{0,2}$"
                    value={isFirstFocused ? '' : currentSlippage}
                    placeholder={currentSlippage}
                    max={50}
                    // decimals={2}
                    onBlur={handleBlur}
                    onChange={(e) => handleChange(e.target.value.replace(/,/gi, '.'))}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    style={{ paddingRight: '30px' }}
                  />
                  <Flex position="absolute" right="8px" top="8px" alignItems="center">
                    <VerticalDivider />
                    <Text color="textSubtle">%</Text>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </Flex>
          {isSwap && new Decimal(currentSlippage || 0).gt('0.5') ? (
            <Box maxWidth="500px">
              <Message mt="2" variant="warning">
                <Text>{t('Your transaction may be frontrun and result in an unfavorable trade')}</Text>
              </Message>
            </Box>
          ) : null}
        </>
      }
    />
  )
}
