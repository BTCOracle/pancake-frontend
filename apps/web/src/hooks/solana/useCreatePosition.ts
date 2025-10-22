import { useCallback } from 'react'
import BN from 'bn.js'
import { isSolWSolToken } from '@pancakeswap/sdk'
import { TxVersion } from '@pancakeswap/solana-core-sdk'
import { UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Bound } from 'config/constants/types'
import { CurrencyField as Field } from 'utils/types'
import { SolanaV3Pool } from 'state/pools/solana'
import { useSolanaPriorityFee } from 'components/WalletModalV2/hooks/useSolanaPriorityFee'

import { useRaydium } from './useRaydium'
import type { CreatePoolBuildData } from './useCreateClmmPool'

type Ticks = { [Bound.LOWER]?: number; [Bound.UPPER]?: number }

type AmountMap = { [key in Field]?: UnifiedCurrencyAmount<UnifiedCurrency> }

type Params = {
  poolInfo?: SolanaV3Pool
  ticks: Ticks
  independentField: Field
  dependentField: Field
  parsedAmounts: AmountMap
  createBuildData?: CreatePoolBuildData
  onTxUpdate?: (data: { txId: string; status: string }[]) => void
}

export function useCreatePosition() {
  const raydium = useRaydium()
  const { computeBudgetConfig } = useSolanaPriorityFee()

  return useCallback(
    async ({
      poolInfo,
      ticks,
      independentField,
      dependentField,
      parsedAmounts,
      createBuildData,
      onTxUpdate = () => {},
    }: Params) => {
      if (!raydium?.clmm || !poolInfo) return { txId: '' }
      const tickLower = ticks[Bound.LOWER]
      const tickUpper = ticks[Bound.UPPER]
      if (!tickLower || !tickUpper) {
        return { txId: '' }
      }
      const isSorted =
        (parsedAmounts[Field.CURRENCY_A] &&
          parsedAmounts[Field.CURRENCY_A].currency.wrapped.address === poolInfo.mintA.address) ||
        (parsedAmounts[Field.CURRENCY_B] &&
          parsedAmounts[Field.CURRENCY_B].currency.wrapped.address === poolInfo.mintB.address)

      const buildData = await raydium.clmm.openPositionFromBase({
        poolInfo,
        poolKeys: createBuildData?.extInfo.address,
        ownerInfo: {
          useSOLBalance:
            isSolWSolToken(poolInfo.mintA as UnifiedCurrency) || isSolWSolToken(poolInfo.mintB as UnifiedCurrency),
        },
        tickLower: Math.min(tickLower, tickUpper),
        tickUpper: Math.max(tickLower, tickUpper),
        base: independentField === Field.CURRENCY_A ? (isSorted ? 'MintA' : 'MintB') : isSorted ? 'MintB' : 'MintA',
        baseAmount: new BN(parsedAmounts[independentField]?.quotient ?? 0),
        otherAmountMax: new BN(parsedAmounts[dependentField]?.quotient ?? 0),
        txVersion: TxVersion.V0,
        nft2022: true,
        computeBudgetConfig: createBuildData ? undefined : computeBudgetConfig,
      })

      if (!buildData) {
        return { txId: '' }
      }
      if (createBuildData) {
        createBuildData.builder.addInstruction({
          ...buildData.builder.AllTxData,
        })
        createBuildData.builder.addCustomComputeBudget(computeBudgetConfig)

        const { execute } = await createBuildData.builder.sizeCheckBuildV0()
        return execute({
          sequentially: true,
          onTxUpdate,
        })
      }
      const res = await buildData.simulate()
      console.log('simulation result: ', res, buildData)
      return buildData.execute()
    },
    [raydium?.clmm, computeBudgetConfig],
  )
}
