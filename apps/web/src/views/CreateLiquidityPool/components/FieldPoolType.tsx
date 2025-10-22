import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  BoxProps,
  ButtonMenu,
  ButtonMenuItem,
  FlexGap,
  LinkExternal,
  PreTitle,
  QuestionHelper,
} from '@pancakeswap/uikit'
import { useCallback } from 'react'
import { usePoolTypeQueryState, useStartingPriceQueryState } from 'state/infinity/create'
import { useHookReset } from 'views/HookSettings/hooks/useHookReset'
import {
  useInfinityResetBinQueryState,
  useInfinityResetCLQueryState,
} from '../hooks/useInfinityFormState/useInfinityFormQueryState'

export type FieldPoolTypeProps = BoxProps

export const FieldPoolType: React.FC<FieldPoolTypeProps> = ({ ...boxProps }) => {
  const { t } = useTranslation()
  const [poolType, setPoolType] = usePoolTypeQueryState()
  const [, setStartPrice] = useStartingPriceQueryState()
  const resetCLQueryState = useInfinityResetCLQueryState()
  const resetBinQueryState = useInfinityResetBinQueryState()
  const resetHook = useHookReset()

  const updatePoolType = useCallback(
    (type: 'CL' | 'Bin') => {
      if (poolType === type) return
      setPoolType(type)
      setStartPrice(null)
      if (type === 'CL') {
        resetBinQueryState()
      } else {
        resetCLQueryState()
      }
      resetHook()
    },
    [poolType, resetBinQueryState, resetCLQueryState, setPoolType, setStartPrice, resetHook],
  )

  const handleMenuItemClick = useCallback(
    (index: number) => {
      const type = index === 0 ? 'CL' : 'Bin'
      updatePoolType(type)
    },
    [updatePoolType],
  )

  const activeIndex = poolType === 'CL' ? 0 : 1

  return (
    <Box {...boxProps}>
      <FlexGap gap="4px">
        <PreTitle mb="8px">{t('Pool Type')}</PreTitle>
        <QuestionHelper
          placement="auto"
          mb="8px"
          color="secondary"
          text={
            <>
              {t(
                'PancakeSwap Infinity supports both CLAMM (Concentrated Liquidity AMM) and LBAMM (Liquidity Book AMM) pools.',
              )}
              <br />
              <br />
              <LinkExternal
                href="https://docs.pancakeswap.finance/trade/pancakeswap-infinity/pool-types"
                fontSize="14px"
              >
                {t('Learn More')}
              </LinkExternal>
            </>
          }
        />
      </FlexGap>
      <ButtonMenu activeIndex={activeIndex} onItemClick={handleMenuItemClick} variant="subtle" fullWidth>
        <ButtonMenuItem height="38px">{t('CLAMM')}</ButtonMenuItem>
        <ButtonMenuItem height="38px">{t('LBAMM')}</ButtonMenuItem>
      </ButtonMenu>
    </Box>
  )
}
