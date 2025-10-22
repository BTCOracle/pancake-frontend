import useV3DerivedInfo from 'hooks/v3/useV3DerivedInfo'
import React, { useMemo } from 'react'
import { useExtraV3PositionInfo } from 'state/farmsV4/hooks'
import { useV3FormState } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { BasicAPRModal, BasicPoolAprModalProps } from './BasicPoolAPRModal'

export const V3PoolAprModal: React.FC<BasicPoolAprModalProps> = ({ modal, ...props }) => {
  const { positionDetail, poolInfo } = props
  const { position } = useExtraV3PositionInfo(positionDetail)
  const posInfo = useMemo(
    () => ({
      amount0: position?.amount0,
      amount1: position?.amount1,
      priceLower: position?.token0PriceLower,
      priceUpper: position?.token0PriceUpper,
    }),
    [position?.amount0, position?.amount1, position?.token0PriceLower, position?.token0PriceUpper],
  )
  const formState = useV3FormState()
  const { pool, price, currencyBalances } = useV3DerivedInfo(
    (poolInfo?.token0 as Currency) ?? undefined,
    (poolInfo?.token1 as Currency) ?? undefined,
    poolInfo?.feeTier,
    (poolInfo?.token0 as Currency) ?? undefined,
    position,
    formState,
  )
  return modal.isOpen ? (
    <BasicAPRModal
      modal={modal}
      position={posInfo}
      liquidity={pool?.liquidity}
      feeProtocol={pool?.feeProtocol}
      price={price}
      currencyBalances={currencyBalances}
      {...props}
    />
  ) : null
}
