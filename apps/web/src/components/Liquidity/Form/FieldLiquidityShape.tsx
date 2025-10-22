import { useTranslation } from '@pancakeswap/localization'
import { Box, BoxProps, PreTitle, RowBetween, ScanLink } from '@pancakeswap/uikit'
import { Liquidity } from '@pancakeswap/widgets-internal'
import React from 'react'
import { useLiquidityShapeQueryState } from 'state/infinity/shared'

export type FieldLiquidityShapeProps = BoxProps

export const FieldLiquidityShape: React.FC<FieldLiquidityShapeProps> = ({ ...boxProps }) => {
  const { t } = useTranslation()
  const [liquidityShape, setLiquidityShape] = useLiquidityShapeQueryState()

  return (
    <Box {...boxProps}>
      <RowBetween>
        <PreTitle>{t('Choose Liquidity Shape')}</PreTitle>
        <ScanLink
          href="https://docs.pancakeswap.finance/trade/pancakeswap-infinity/pool-types"
          fontSize="12px"
          textTransform="uppercase"
          color="primary60"
        >
          {t('Learn More')}
        </ScanLink>
      </RowBetween>
      <Liquidity.LiquidityShapePicker mt="8px" value={liquidityShape} onChange={setLiquidityShape} />
    </Box>
  )
}
