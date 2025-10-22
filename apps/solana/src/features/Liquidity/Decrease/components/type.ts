import { TooltipProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

export type IncreaseLiquidityPageQuery = {
  pool_id?: string
  action?: string
  mode?: LiquidityActionModeType
}

export type IncreaseTabOptionType = {
  value: 'Add Liquidity' | 'Stake Liquidity'
  label: ReactNode
  disabled?: boolean
  tooltipProps?: Omit<TooltipProps, 'children'>
}

export type LiquidityActionModeType = 'add' | 'remove' | 'stake' | 'unstake' | 'init'

export type LiquidityFarmActionModeType = 'select' | 'reward' | 'review' | 'done'

export type CreateFarmType = 'Standard' | 'Concentrated'

export type LiquidityTabOptionType = IncreaseTabOptionType['value'] | DecreaseTabOptionType['value']

export type DecreaseTabOptionType = {
  value: 'Unstake Liquidity' | 'Remove Liquidity'
  label: string
}

export type DecreaseLiquidityPageQuery = {
  mode?: LiquidityActionModeType
  pool_id?: string
  farm_id?: string
}
