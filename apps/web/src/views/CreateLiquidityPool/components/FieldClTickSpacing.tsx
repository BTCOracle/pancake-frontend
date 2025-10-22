import { MAX_TICK_SPACING, MIN_TICK_SPACING } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Box, BoxProps, FlexGap, Input, PreTitle, QuestionHelper, Text } from '@pancakeswap/uikit'
import { useEffect, useMemo, useState } from 'react'
import { useClTickSpacingQueryState } from 'state/infinity/create'

type FieldClTickSpacingProps = BoxProps

export const FieldClTickSpacing: React.FC<FieldClTickSpacingProps> = ({ ...boxProps }) => {
  const { t } = useTranslation()

  const [tickSpacing, setTickSpacing] = useClTickSpacingQueryState()

  const isTickSpacingValid = useMemo(() => {
    if (tickSpacing === null) return true

    return tickSpacing >= Number(MIN_TICK_SPACING) && tickSpacing <= Number(MAX_TICK_SPACING)
  }, [tickSpacing])

  const [hasInitialized, setHasInitialized] = useState(false)
  useEffect(() => {
    if (!hasInitialized && tickSpacing === null) {
      setTickSpacing(1)
      setHasInitialized(true)
    }
  }, [tickSpacing, setTickSpacing, hasInitialized])

  return (
    <Box {...boxProps}>
      <FlexGap gap="4px">
        <PreTitle mb="8px">{t('TickSpacing')}</PreTitle>
        <QuestionHelper
          mb="8px"
          placement="auto"
          color="secondary"
          text={t(
            'A tick represents 0.01% price change. Ticks divisible by TickSpacing can only be initialised e.g., with TickSpacing of 3, every 3rd tick must be initialized , i.e., ..., -6, -3, 0, 3, 6, …',
          )}
        />
      </FlexGap>

      <Input
        value={tickSpacing ?? ''}
        onChange={(e) => setTickSpacing(e.target.value === '' ? null : Number(e.target.value))}
        min={MIN_TICK_SPACING.toString()}
        max={MAX_TICK_SPACING.toString()}
        isError={!isTickSpacingValid}
        placeholder="0"
        inputMode="decimal"
      />
      {!isTickSpacingValid && (
        <>
          <Text mt="8px" color="failure" small>
            {t('Tick Spacing must be between %min% and %max%', {
              min: MIN_TICK_SPACING.toString(),
              max: MAX_TICK_SPACING.toString(),
            })}
          </Text>
        </>
      )}
    </Box>
  )
}
