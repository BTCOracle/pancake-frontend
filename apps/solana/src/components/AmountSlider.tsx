import { Slider } from '@pancakeswap/uikit'
import { Button, Box, BoxProps, HStack, Text } from '@chakra-ui/react'
import { ReactNode, RefObject, useEffect, useState, useImperativeHandle } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import toPercentString from '@/utils/numberish/toPercentString'
import { colors } from '@/theme/cssVariables'
import { useSyncSignal } from '@/hooks/useSyncSignalState'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import PanelCard from './PanelCard'

export type AmountSliderProps = {
  percent?: number
  actionRef?: RefObject<{ changeValue: (val: number) => void }>

  // size?: 'sm' /* used in mobile */ | 'md' /** used in PC */

  /** see chakra's <Slider>'s prop:isDisabled */
  isDisabled?: boolean
  isRenderTopLeftLabel?: boolean
  renderTopLeftLabel?: () => ReactNode
  // renderTopLeftPercent?: () => ReactNode
  onChange?: (percent: number) => void
  // will change on progress, very frequently
  onHotChange?: (percent: number) => void
} & Omit<BoxProps, 'onChange'>

export default function AmountSlider({
  percent: inputPercent = 0,
  actionRef,
  isDisabled,
  isRenderTopLeftLabel = true,
  renderTopLeftLabel: _renderTopLeftLabel,
  onChange,
  onHotChange,
  ...restBoxProps
}: AmountSliderProps) {
  const { t } = useTranslation()
  const renderTopLeftLabel = _renderTopLeftLabel ?? (() => t('Amount'))
  const sizes = {
    percentValueText: ['2xl', '3xl'],
    topLeftLabel: ['sm', 'md'],
    topLeftLabelAndPercentSpace: [2, 6],
    buttonSpace: [2, 4]
  }
  const btnStyle = {
    variant: 'primary60' as const,
    scale: 'xs' as const,
    borderRadius: '8px',
    disabled: isDisabled
  }
  /* const [percent, setPercent] = useSyncSignal({
    outsideValue: inputPercent ?? 0,
    onChange: (val) => {
      onChange?.(val)
    }
  }) */

  // const [hotPercent, setHotPercent] = useState(percent)

  /* useEffect(() => {
    onHotChange?.(hotPercent)
  }, [hotPercent, onHotChange]) */

  /* useEffect(() => {
    setHotPercent?.(inputPercent)
  }, [inputPercent]) */

  /* useImperativeHandle(actionRef, () => ({
    changeValue: setHotPercent
  })) */

  return (
    <PanelCard bg={colors.background} gap={2} px="16px" py="12px" {...restBoxProps}>
      <HStack justify="space-between">
        <HStack spacing={sizes.topLeftLabelAndPercentSpace}>
          {isRenderTopLeftLabel && (
            <Text color={colors.textPrimary} fontSize={sizes.topLeftLabel} fontWeight={600}>
              {renderTopLeftLabel()}
            </Text>
          )}
          <Text color={colors.textPrimary} fontSize={sizes.percentValueText} fontWeight={600}>
            {toPercentString(inputPercent, { decimals: 0, alreadyPercented: true })}
          </Text>
        </HStack>

        <HStack spacing={2}>
          {[25, 50, 75, 100].map((percent) => (
            <Button
              disabled={isDisabled}
              height="28px"
              px="8px"
              variant="primary60"
              size="xs"
              onClick={() => {
                // setHotPercent(percent)
                onChange?.(percent)
              }}
            >
              {percent}%
            </Button>
          ))}
        </HStack>
      </HStack>
      <Box>
        <Slider
          name="lp-amount"
          disabled={isDisabled}
          min={0}
          max={100}
          value={inputPercent}
          onValueChanged={(percent_) => {
            onHotChange?.(percent_)
          }}
        />
      </Box>
    </PanelCard>
  )
}
