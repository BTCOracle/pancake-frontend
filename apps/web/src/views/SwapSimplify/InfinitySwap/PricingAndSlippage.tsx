import { useModal } from '@pancakeswap/uikit'
import { SwapUIV2 } from '@pancakeswap/widgets-internal'

import { Currency, Price } from '@pancakeswap/sdk'
import { memo } from 'react'

import GlobalSettings from 'components/Menu/GlobalSettings'
import { useIsWrapping } from '../../Swap/V3Swap/hooks'

interface Props {
  priceLoading?: boolean
  price?: Price<Currency, Currency>
}

export const PricingAndSlippage = memo(function PricingAndSlippage({ priceLoading, price }: Props) {
  const isWrapping = useIsWrapping()
  const [onPresentSettingsModal] = useModal(<GlobalSettings />)

  if (isWrapping || !price) {
    return null
  }

  const priceNode = price ? (
    <>
      <SwapUIV2.TradePrice price={price} loading={priceLoading} />
    </>
  ) : null

  return <SwapUIV2.SwapInfo price={priceNode} onSlippageClick={onPresentSettingsModal} />
})
