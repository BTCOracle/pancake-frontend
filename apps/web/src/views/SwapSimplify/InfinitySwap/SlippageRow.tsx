import { useMemo } from 'react'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { PriceOrder } from '@pancakeswap/price-api-sdk'
import { QuestionHelperV2, Text } from '@pancakeswap/uikit'
import { SlippageButton } from 'views/Swap/components/SlippageButton'
import { useTranslation } from '@pancakeswap/localization'

import { usePriceBreakdown } from '../hooks/usePriceBreakdown'
import { DetailsTitle } from './AdvancedSwapDetails'

export const SlippageRow = ({ order }: { order?: PriceOrder }) => {
  const { t } = useTranslation()
  const priceBreakdown = usePriceBreakdown(order)

  // if priceBreakdown is an array and priceBreakdown only has one item, hide the slippage button because it's bridge-only case
  const isBridgeOnlyCase = useMemo(() => {
    return Array.isArray(priceBreakdown) && priceBreakdown.length === 1
  }, [priceBreakdown])

  return (
    !isBridgeOnlyCase && (
      <RowBetween mt="8px">
        <RowFixed>
          <QuestionHelperV2
            text={
              <Text>
                {t(
                  'Permissible price deviation (%) between quoted and execution price of swap. For cross-chain swaps, this applies separately to both source and destination chains.',
                )}
              </Text>
            }
            placement="top"
          >
            <DetailsTitle>{t('Slippage Tolerance')}</DetailsTitle>
          </QuestionHelperV2>
        </RowFixed>
        <SlippageButton enableAutoSlippage />
      </RowBetween>
    )
  )
}
