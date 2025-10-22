import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import React, { useMemo } from 'react'
import { useExtraInfinityPositionInfo } from 'state/farmsV4/hooks'
import type { InfinityCLPositionDetail, PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { CurrencyField } from 'utils/types'
import { useAccount } from 'wagmi'

import { BasicAPRModal, BasicPoolAprModalProps } from './BasicPoolAPRModal'

export const InfinityPoolAprModal: React.FC<BasicPoolAprModalProps<InfinityCLPositionDetail>> = ({
  modal,
  ...props
}) => {
  const { address } = useAccount()
  const { positionDetail, poolInfo, ...rest } = props
  const posInfo = useExtraInfinityPositionInfo(positionDetail)
  const { pool } = posInfo

  const balances = useCurrencyBalances(
    address,
    useMemo(() => [poolInfo.token0, poolInfo.token1], [poolInfo.token0, poolInfo.token1]),
  )
  const currencyBalances: { [field in CurrencyField]?: CurrencyAmount<Currency> } = useMemo(
    () => ({
      [CurrencyField.CURRENCY_A]: balances[0],
      [CurrencyField.CURRENCY_B]: balances[1],
    }),
    [balances],
  )
  return modal.isOpen ? (
    <BasicAPRModal
      modal={modal}
      position={posInfo}
      liquidity={pool?.liquidity}
      feeProtocol={pool?.feeProtocol}
      price={posInfo.price}
      currencyBalances={currencyBalances}
      positionDetail={positionDetail as unknown as PositionDetail}
      poolInfo={poolInfo}
      {...rest}
    />
  ) : null
}
