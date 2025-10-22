import { useCallback } from 'react'
import { PublicKey } from '@solana/web3.js'
import {
  ClmmKeys,
  MakeTxData,
  TxV0BuildData,
  TxVersion,
  type ApiV3PoolInfoConcentratedItem,
} from '@pancakeswap/solana-core-sdk'
import { PancakeClmmProgramId } from '@pancakeswap/solana-clmm-sdk'
import Decimal from 'decimal.js'
import { Currency, CurrencyAmount, SPLToken } from '@pancakeswap/swap-sdk-core'
import { useClmmAmmConfigs } from './useClmmAmmConfigs'
import { useRaydium } from './useRaydium'

type CreateArgs = {
  mintA: SPLToken
  mintB: SPLToken
  tradeFeeRate: number // basis points in 1e4 (e.g., 2500)
  initialPrice: number | string // price of A in terms of B
  // Optional: open position immediately after pool creation
  position?: {
    tickLower: number
    tickUpper: number
    amountA?: CurrencyAmount<Currency>
    amountB?: CurrencyAmount<Currency>
  }
}

export type CreatePoolBuildData = TxV0BuildData<{ mockPoolInfo: ApiV3PoolInfoConcentratedItem; address: ClmmKeys }>

export function useCreateClmmPool() {
  const raydium = useRaydium()
  const ammConfigs = useClmmAmmConfigs()

  return useCallback(
    async ({
      mintA,
      mintB,
      tradeFeeRate,
      initialPrice,
    }: CreateArgs): Promise<{
      txId: string
      buildData?: MakeTxData<
        TxVersion.V0,
        {
          mockPoolInfo: ApiV3PoolInfoConcentratedItem
          address: ClmmKeys
        }
      >
    }> => {
      if (!raydium) throw new Error('Raydium client not ready')

      // Resolve AMM config by trade fee rate
      const cfg = Object.values(ammConfigs).find((c) => c.tradeFeeRate === tradeFeeRate)
      if (!cfg) throw new Error('Unsupported fee config')

      const programId = PancakeClmmProgramId['mainnet-beta']
      const buildData = await raydium.clmm.createPool({
        programId,
        mint1: { ...mintA, name: mintA.name ?? '' },
        mint2: { ...mintB, name: mintB.name ?? '' },
        ammConfig: {
          ...cfg,
          id: new PublicKey(cfg.id),
          description: cfg.description ?? '',
        },
        initialPrice: new Decimal(initialPrice),
        forerunCreate: true,
        txVersion: TxVersion.V0,
      })
      return { txId: '', buildData }
    },
    [ammConfigs, raydium],
  )
}
