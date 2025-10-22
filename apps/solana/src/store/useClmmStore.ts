import { TranslateFunction } from '@pancakeswap/localization'
import { ammConfigs, PancakeClmmProgramId } from '@pancakeswap/solana-clmm-sdk'
import {
  ApiClmmConfigInfo,
  ApiV3PoolInfoConcentratedItem,
  ApiV3Token,
  ClmmKeys,
  ClmmLockAddress,
  ClmmPositionLayout,
  DecreaseLiquidityEventLayout,
  getTransferAmountFeeV2,
  InitRewardsParams,
  MakeMultiTxData,
  MakeTxData,
  OpenPositionFromBaseExtInfo,
  PoolUtils,
  Price,
  ReturnTypeGetPriceAndTick,
  SetRewardsParams,
  solToWSolToken,
  TickUtils,
  toToken,
  TxBuildData,
  TxV0BuildData,
  TxVersion
} from '@pancakeswap/solana-core-sdk'
import { PublicKey, RpcResponseAndContext, SimulatedTransactionResponse } from '@solana/web3.js'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import PQueue from 'p-queue'
import { getDefaultToastData, handleMultiTxToast, transformProcessData } from '@/hooks/toast/multiToastUtil'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { txStatusSubject } from '@/hooks/toast/useTxStatus'
import { useAppStore, useLiquidityStore, useTokenAccountStore } from '@/store'
import createStore from '@/store/createStore'
import { getMintSymbol, isSolWSol, shortenAddress } from '@/utils/token'
import getEphemeralSigners from '@/utils/tx/getEphemeralSigners'

import { ClmmLockInfo } from '@/hooks/portfolio/clmm/useClmmBalance'
import { handleMultiTxRetry } from '@/hooks/toast/retryTx'
import { getComputeBudgetConfig } from '@/utils/tx/computeBudget'
import { getClmmKeysFromPoolInfo } from '@/utils/getPoolKeysFromPoolInfo'
import toPercentString from '@/utils/numberish/toPercentString'
import { TxCallbackProps, TxCallbackPropsGeneric } from '../types/tx'
import { getTxMeta } from './configs/clmm'

const rewardsSimulateQueue = new PQueue({
  // concurrency: 2,
  interval: 1000,
  intervalCap: 2
})

export type CreatePoolBuildData =
  | TxBuildData<{ mockPoolInfo: ApiV3PoolInfoConcentratedItem; address: ClmmKeys }>
  | TxV0BuildData<{ mockPoolInfo: ApiV3PoolInfoConcentratedItem; address: ClmmKeys }>

interface ClmmState {
  positionLoading: boolean

  clmmFeeConfigs: Record<string, ApiClmmConfigInfo>
  currentPoolInfo?: ApiV3PoolInfoConcentratedItem
  currentPoolLoading: boolean
  rewardWhiteListMints: PublicKey[]
  operationOwners: PublicKey[]

  rewardsSimulateQueue: PQueue

  harvestAllAct: (
    props: {
      t: TranslateFunction
      allPoolInfo: Record<string, ApiV3PoolInfoConcentratedItem>
      allPositions: Record<string, ClmmPositionLayout[]>
      lockInfo: ClmmLockInfo
      programId?: string
      execute?: boolean
    } & TxCallbackProps
  ) => Promise<{ txId: string; buildData?: MakeMultiTxData<TxVersion> }>
  openPositionAct: (
    props: {
      t: TranslateFunction
      poolInfo: ApiV3PoolInfoConcentratedItem
      poolKeys?: ClmmKeys
      tickLower: number
      tickUpper: number
      baseAmount: string
      otherAmountMax: string
      base: 'MintA' | 'MintB'
      createPoolBuildData?: CreatePoolBuildData
      onCloseToast?: () => void
    } & TxCallbackProps<{
      txId: string
      buildData: TxBuildData<OpenPositionFromBaseExtInfo> | TxV0BuildData<OpenPositionFromBaseExtInfo>
    }>
  ) => Promise<{
    txId: string
    buildData?: MakeTxData<TxVersion.LEGACY, OpenPositionFromBaseExtInfo> | MakeTxData<TxVersion.V0, OpenPositionFromBaseExtInfo>
  }>
  closePositionAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      position: ClmmPositionLayout
    } & TxCallbackProps
  ) => Promise<string>
  removeLiquidityAct: <TSimulate extends boolean = false>(
    props: {
      simulateOnly?: TSimulate
      poolInfo: ApiV3PoolInfoConcentratedItem
      position: ClmmPositionLayout
      liquidity: number | string | BN
      amountMinA: number | string | BN
      amountMinB: number | string | BN
      needRefresh?: boolean
      harvest?: boolean
      closePosition?: boolean
    } & TxCallbackProps
  ) => Promise<ReturnType<typeof DecreaseLiquidityEventLayout.decode> | string>
  removeLiquidityActThrottle: <TSimulate extends boolean = false>(
    props: {
      simulateOnly?: TSimulate
      poolInfo: ApiV3PoolInfoConcentratedItem
      position: ClmmPositionLayout
      liquidity: number | string | BN
      amountMinA: number | string | BN
      amountMinB: number | string | BN
      needRefresh?: boolean
      harvest?: boolean
      closePosition?: boolean
    } & TxCallbackProps
  ) => Promise<ReturnType<typeof DecreaseLiquidityEventLayout.decode> | string>
  increaseLiquidityAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      position: ClmmPositionLayout
      liquidity: BN
      amountMaxA: number | string | BN
      amountMaxB: number | string | BN
      onCloseToast?: () => void
    } & TxCallbackProps
  ) => Promise<string>
  lockPositionAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      position: ClmmPositionLayout
      onCloseToast?: () => void
    } & TxCallbackPropsGeneric<ClmmLockAddress>
  ) => Promise<string>
  collectRewardAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      rewardMint: PublicKey
    } & TxCallbackProps
  ) => Promise<string>
  harvestLockPositionAct: (
    props: {
      lockData: ClmmLockInfo['']['']
      poolInfo: ApiV3PoolInfoConcentratedItem
      position: ClmmPositionLayout
      needRefresh?: boolean
      onCloseToast?: () => void
    } & TxCallbackProps
  ) => Promise<string>
  fetchAmmConfigsAct: () => void
  createClmmPool: (props: {
    config: ApiClmmConfigInfo
    token1: ApiV3Token
    token2: ApiV3Token
    price: string
    execute?: boolean
    forerunCreate?: boolean
    getObserveState?: boolean
  }) => Promise<{
    txId: string
    buildData?:
      | MakeTxData<
          TxVersion.LEGACY,
          {
            mockPoolInfo: ApiV3PoolInfoConcentratedItem
            address: ClmmKeys
          }
        >
      | MakeTxData<
          TxVersion.V0,
          {
            mockPoolInfo: ApiV3PoolInfoConcentratedItem
            address: ClmmKeys
          }
        >
  }>

  createFarm: (props: Pick<InitRewardsParams, 'poolInfo' | 'rewardInfos'> & TxCallbackProps) => Promise<string>

  convertPoolPrice: (props: { pool: ApiV3PoolInfoConcentratedItem; price: string | number }) => Price | undefined
  getPriceAndTick: (props: {
    pool?: ApiV3PoolInfoConcentratedItem
    price: string
    baseIn: boolean
    decimals?: number
  }) => ReturnTypeGetPriceAndTick | undefined
  getTickPrice: (props: { pool?: ApiV3PoolInfoConcentratedItem; tick: number; baseIn: boolean }) => ReturnTypeGetPriceAndTick | undefined
  computePairAmount: (props: {
    pool?: ApiV3PoolInfoConcentratedItem
    inputA: boolean
    tickLower?: number
    tickUpper?: number
    amount: string
  }) => Promise<
    | {
        amountSlippageA: Decimal
        amountSlippageB: Decimal
        amountA: Decimal
        amountB: Decimal
        liquidity: BN
      }
    | undefined
  >

  loadAddRewardWhiteListAct: (props?: { checkFetch: boolean }) => void
  loadOperationOwnersAct: (props?: { checkFetch: boolean }) => void
  setRewardsAct: (
    props: {
      poolInfo: ApiV3PoolInfoConcentratedItem
      poolKeys?: ClmmKeys
      rewardInfos: SetRewardsParams['rewardInfos']
      newRewardInfos: SetRewardsParams['rewardInfos']
    } & TxCallbackProps
  ) => Promise<string>
  reset: () => void
}

const clmmInitState = {
  positionLoading: false,
  currentPoolLoading: true,
  clmmFeeConfigs: {},
  rewardWhiteListMints: [],
  operationOwners: [],
  slippage: 0.005,
  rewardsSimulateQueue
}

export const useClmmStore = createStore<ClmmState>(
  (set, get) => ({
    ...clmmInitState,
    harvestAllAct: async ({ t, allPoolInfo, allPositions, lockInfo, programId, execute, ...txProps }) => {
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium) {
        toastSubject.next({ noRpc: true })
        return { txId: '' }
      }

      const buildData = await raydium.clmm.harvestAllRewards({
        allPoolInfo,
        allPositions,
        ownerInfo: {
          useSOLBalance: true
        },
        lockInfo,
        programId: programId ? new PublicKey(programId) : undefined,
        txVersion,
        computeBudgetConfig: execute ? await getComputeBudgetConfig() : undefined
      })

      if (execute) {
        const meta = getTxMeta({
          action: 'harvest',
          values: { symbol: 'All Clmm' }
        })

        const txLength = buildData.transactions.length
        const { toastId, processedId, handler } = getDefaultToastData({
          txLength,
          ...txProps
        })
        const getSubTxTitle = () => meta.txHistoryTitle

        buildData
          .execute({
            sequentially: true,
            onTxUpdate: (data) => {
              handleMultiTxRetry(data)
              handleMultiTxToast({
                t,
                toastId,
                processedId: transformProcessData({ processedId, data }),
                txLength,
                meta,
                handler,
                getSubTxTitle
              })
            }
          })
          .then(() => {
            handleMultiTxToast({
              t,
              toastId,
              processedId: transformProcessData({ processedId, data: [] }),
              txLength,
              meta,
              handler,
              getSubTxTitle
            })
            return { txId: '', buildData }
          })
          .catch((e) => {
            txProps.onError?.(e)
            toastSubject.next({ ...meta, txError: e })
            return { txId: '' }
          })
          .finally(txProps.onFinally)
      }
      return {
        txId: '',
        buildData
      }
    },

    openPositionAct: async ({
      t,
      poolInfo,
      poolKeys,
      base,
      tickLower,
      tickUpper,
      baseAmount,
      otherAmountMax,
      createPoolBuildData,
      onCloseToast,
      ...txProps
    }) => {
      const { raydium, wallet, txVersion } = useAppStore.getState()
      if (!raydium) {
        toastSubject.next({ noRpc: true })
        return { txId: '' }
      }
      if (!poolInfo) return { txId: '' }
      try {
        const computeBudgetConfig = await getComputeBudgetConfig()
        const buildData = await raydium.clmm.openPositionFromBase({
          poolInfo,
          poolKeys,
          tickLower: Math.min(tickLower, tickUpper),
          tickUpper: Math.max(tickLower, tickUpper),
          base,
          ownerInfo: {
            useSOLBalance: isSolWSol(poolInfo.mintA.address) || isSolWSol(poolInfo.mintB.address)
          },
          baseAmount: new BN(baseAmount),
          otherAmountMax: new BN(otherAmountMax),
          getEphemeralSigners: wallet ? await getEphemeralSigners(wallet) : undefined,
          computeBudgetConfig: createPoolBuildData ? undefined : computeBudgetConfig,
          txVersion,
          nft2022: true
        })

        const [amountA, amountB] = base === 'MintA' ? [baseAmount, otherAmountMax] : [otherAmountMax, baseAmount]
        const meta = getTxMeta({
          action: 'openPosition',
          values: {
            amountA:
              new Decimal(amountA || 0)
                .div(10 ** poolInfo.mintA.decimals)
                .toDecimalPlaces(poolInfo.mintA.decimals)
                .toString() || 0,
            symbolA: getMintSymbol({ mint: poolInfo.mintA, transformSol: true }),
            amountB:
              new Decimal(amountB || 0)
                .div(10 ** poolInfo.mintB.decimals)
                .toDecimalPlaces(poolInfo.mintB.decimals)
                .toString() || 0,
            symbolB: getMintSymbol({ mint: poolInfo.mintB, transformSol: true })
          }
        })

        const mintInfo = [poolInfo.mintA, poolInfo.mintB]

        if (!buildData) {
          txProps.onError?.('build call data failed')
          return { txId: '' }
        }

        // create pool and open position
        if (createPoolBuildData) {
          const createPoolMeta = getTxMeta({
            action: 'createPool',
            values: {}
          })
          createPoolBuildData.builder.addInstruction({
            ...buildData.builder.AllTxData
          })
          createPoolBuildData.builder.addCustomComputeBudget(computeBudgetConfig)

          const { transactions, execute } = await createPoolBuildData.builder.sizeCheckBuildV0()

          const txLength = transactions.length
          const { toastId, processedId, handler } = getDefaultToastData({
            txLength,
            ...txProps
          })

          const getSubTxTitle = (idx: number) =>
            idx !== transactions.length - 1 ? 'transaction_history.create_pool' : 'transaction_history.name_add_liquidity'

          return execute({
            sequentially: true,
            onTxUpdate: (data) => {
              handleMultiTxRetry(data)
              handleMultiTxToast({
                t,
                toastId,
                processedId: transformProcessData({ processedId, data }),
                txLength,
                meta: createPoolMeta,
                handler,
                getSubTxTitle
              })
            }
          })
            .then(() => {
              handleMultiTxToast({
                t,
                toastId,
                processedId: transformProcessData({ processedId, data: [] }),
                txLength,
                meta: createPoolMeta,
                handler,
                getSubTxTitle
              })
              return { txId: '', buildData }
            })
            .catch((e) => {
              toastSubject.next({ txError: e, ...createPoolMeta })
              txProps.onError?.(e)
              txProps.onFinally?.()
              return { txId: '' }
            })
            .finally(txLength > 1 ? undefined : txProps.onFinally)
        }

        return buildData
          .execute()
          .then(({ txId, signedTx }) => {
            txStatusSubject.next({
              txId,
              ...meta,
              mintInfo,
              signedTx,
              onClose: onCloseToast,
              onError: txProps.onError,
              onConfirmed: txProps.onConfirmed
            })
            txProps.onSent?.({ txId, buildData })
            return { txId, buildData }
          })
          .catch((e) => {
            txProps.onError?.(e)
            toastSubject.next({ txError: e, ...meta })
            return { txId: '' }
          })
          .finally(txProps.onFinally)
      } catch (e: any) {
        txProps.onError?.(e)
        txProps.onFinally?.()
        console.error(e.message)
        return { txId: '' }
      }
    },

    removeLiquidityAct: async ({
      poolInfo,
      position,
      liquidity,
      amountMinA,
      amountMinB,
      needRefresh,
      closePosition,
      harvest,
      simulateOnly = false,
      onSent,
      onError,
      onFinally,
      onConfirmed
    }) => {
      const { raydium, txVersion, getEpochInfo } = useAppStore.getState()
      const { slippage } = useLiquidityStore.getState()
      if (!raydium) return ''

      const [_amountMinA, _amountMinB] = [
        new BN(
          new Decimal(amountMinA.toString())
            .mul(1 - slippage)
            .mul(10 ** poolInfo.mintA.decimals)
            .toFixed(0)
        ),
        new BN(
          new Decimal(amountMinB.toString())
            .mul(1 - slippage)
            .mul(10 ** poolInfo.mintB.decimals)
            .toFixed(0)
        )
      ]
      const epochInfo = await getEpochInfo()
      const { fee: feeA = new BN(0) } = getTransferAmountFeeV2(_amountMinA, poolInfo.mintA.extensions?.feeConfig, epochInfo!, false)
      const { fee: feeB = new BN(0) } = getTransferAmountFeeV2(_amountMinB, poolInfo.mintB.extensions?.feeConfig, epochInfo!, false)

      try {
        const computeBudgetConfig = await getComputeBudgetConfig()
        const { execute, simulate } = await raydium.clmm.decreaseLiquidity({
          poolInfo,
          poolKeys: getClmmKeysFromPoolInfo(poolInfo),
          ownerPosition: position,
          ownerInfo: {
            useSOLBalance: true,
            closePosition:
              !position.liquidity.eq(new BN(liquidity)) || harvest ? false : closePosition ?? position.liquidity.eq(new BN(liquidity))
          },
          liquidity: new BN(liquidity),
          amountMinA: _amountMinA.sub(feeA),
          amountMinB: _amountMinB.sub(feeB),
          computeBudgetConfig,
          txVersion
        })

        const meta = getTxMeta({
          action: harvest ? 'harvest' : 'removeLiquidity',
          values: {
            amountA: amountMinA || 0,
            symbolA: getMintSymbol({ mint: poolInfo.mintA, transformSol: true }),
            amountB: amountMinB || 0,
            symbolB: getMintSymbol({ mint: poolInfo.mintB, transformSol: true })
          }
        })

        if (simulateOnly) {
          try {
            const simulateResult = await simulate({
              accounts: {
                encoding: 'base64',
                addresses: poolInfo.rewardDefaultInfos.map((r) => r.mint.address)
              }
            })
            // console.log('simulateResult', simulateResult)

            if (!simulateResult.value.logs || simulateResult.value.logs.length < 3) {
              onError?.()
              toastSubject.next({ txError: new Error('Simulation failed'), ...meta })
              return ''
            }
            const disclaimerDigest = await crypto.subtle.digest('SHA-256', Buffer.from('event:DecreaseLiquidityEvent', 'utf-8'))
            const disclaimer = Buffer.from(disclaimerDigest).toString('base64').slice(0, 8)

            const data = simulateResult.value.logs
              .find((log) => log.startsWith(`Program data: ${disclaimer}`))
              ?.slice(`Program data: `.length)
            if (!data) {
              onError?.()
              // toastSubject.next({ txError: new Error('DecreaseLiquidityEvent not found in logs'), ...meta })
              return ''
            }
            const decreaseLiquidityEventData = DecreaseLiquidityEventLayout.decode(Buffer.from(data, 'base64'))

            onFinally?.()
            return decreaseLiquidityEventData
          } catch (e) {
            console.error('Simulation error:', e)
            onError?.(e)
          } finally {
            onFinally?.()
          }
          return {} as ReturnType<typeof DecreaseLiquidityEventLayout.decode>
        }

        return execute()
          .then(({ txId, signedTx }) => {
            txStatusSubject.next({
              txId,
              ...meta,
              mintInfo: [poolInfo.mintA, poolInfo.mintB],
              signedTx,
              onError,
              onSent,
              onConfirmed: () => {
                onConfirmed?.()
                if (needRefresh) setTimeout(() => useTokenAccountStore.setState({ refreshClmmPositionTag: Date.now() }), 500)
              }
            })
            return txId
          })
          .catch((e) => {
            onError?.(e)
            toastSubject.next({ txError: e, ...meta })
            return ''
          })
          .finally(() => onFinally?.())
      } catch (err) {
        console.error(err)
        onError?.(err)
        onFinally?.()
        return ''
      }
    },

    removeLiquidityActThrottle: async (props) => {
      const result = await get().rewardsSimulateQueue.add(async () => {
        const result = await get().removeLiquidityAct(props)
        return result
      })
      return result as ReturnType<typeof DecreaseLiquidityEventLayout.decode> | string
    },

    closePositionAct: async ({ poolInfo, position, ...txProps }) => {
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium) return ''
      try {
        const { execute } = await raydium.clmm.closePosition({
          poolInfo,
          ownerPosition: position,
          txVersion
        })

        const meta = getTxMeta({
          action: 'closePosition',
          values: {
            mint: position.nftMint.toBase58().slice(0, 6).toUpperCase()
          }
        })

        return execute()
          .then(({ txId, signedTx }) => {
            txStatusSubject.next({
              txId,
              signedTx,
              ...meta,
              ...txProps
            })
            return txId
          })
          .catch((e) => {
            txProps.onError?.(e)
            toastSubject.next({ txError: e, ...meta })
            return ''
          })
          .finally(txProps.onFinally)
      } catch (e) {
        txProps.onError?.(e)
        txProps.onFinally?.()
        return ''
      }
    },

    increaseLiquidityAct: async ({ poolInfo, position, liquidity, amountMaxA, amountMaxB, ...txProps }) => {
      const { raydium, txVersion } = useAppStore.getState()
      const { slippage } = useLiquidityStore.getState()
      if (!raydium) return ''
      try {
        const computeBudgetConfig = await getComputeBudgetConfig()
        const { execute } = await raydium.clmm.increasePositionFromLiquidity({
          poolInfo,
          ownerPosition: position,
          ownerInfo: {
            useSOLBalance: isSolWSol(poolInfo.mintA.address) || isSolWSol(poolInfo.mintB.address)
          },
          liquidity: new BN(new Decimal(liquidity.toString()).mul(1 - slippage).toFixed(0)),
          amountMaxA: new BN(amountMaxA),
          amountMaxB: new BN(amountMaxB),
          checkCreateATAOwner: true,
          computeBudgetConfig,
          txVersion
        })

        const meta = getTxMeta({
          action: 'increaseLiquidity',
          values: {
            amountA: new Decimal(amountMaxA.toString())
              .div(10 ** poolInfo.mintA.decimals)
              .toDecimalPlaces(poolInfo.mintA.decimals)
              .toString(),
            symbolA: getMintSymbol({ mint: poolInfo.mintA, transformSol: true }),
            amountB: new Decimal(amountMaxB.toString())
              .div(10 ** poolInfo.mintB.decimals)
              .toDecimalPlaces(poolInfo.mintB.decimals)
              .toString(),
            symbolB: getMintSymbol({ mint: poolInfo.mintB, transformSol: true })
          }
        })

        return execute()
          .then(({ txId, signedTx }) => {
            txStatusSubject.next({
              txId,
              ...meta,
              signedTx,
              mintInfo: [poolInfo.mintA, poolInfo.mintB],
              onSent: txProps.onSent,
              onClose: txProps.onCloseToast,
              onConfirmed: () => {
                txProps.onConfirmed?.()
                setTimeout(() => {
                  useTokenAccountStore.setState({ refreshClmmPositionTag: Date.now() })
                }, 500)
              }
            })
            return txId
          })
          .catch((e) => {
            txProps.onError?.(e)
            toastSubject.next({ txError: e, ...meta })
            return ''
          })
          .finally(txProps.onFinally)
      } catch (err) {
        console.error(err)
        txProps.onError?.(err)
        txProps.onFinally?.()
        return ''
      }
    },

    collectRewardAct: async ({ poolInfo, rewardMint, ...txProps }) => {
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium) return ''
      const computeBudgetConfig = await getComputeBudgetConfig()
      const { execute } = await raydium.clmm.collectReward({
        ownerInfo: { useSOLBalance: true },
        poolInfo,
        poolKeys: getClmmKeysFromPoolInfo(poolInfo),
        rewardMint,
        txVersion,
        computeBudgetConfig
      })

      const meta = getTxMeta({
        action: 'harvest',
        values: {}
      })

      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({
            txId,
            ...meta,
            signedTx,
            mintInfo: [poolInfo.mintA, poolInfo.mintB],
            ...txProps
          })
          return txId
        })
        .catch((e) => {
          txProps.onError?.(e)
          toastSubject.next({ txError: e, ...meta })
          return ''
        })
        .finally(() => {
          txProps.onFinally?.()
        })
    },

    lockPositionAct: async ({ poolInfo, position, ...txProps }) => {
      const { raydium, txVersion, wallet } = useAppStore.getState()
      if (!raydium) return ''
      const computeBudgetConfig = await getComputeBudgetConfig()
      const { execute, extInfo } = await raydium.clmm.lockPosition({
        ownerPosition: position,
        txVersion,
        computeBudgetConfig,
        getEphemeralSigners: wallet ? await getEphemeralSigners(wallet) : undefined
      })

      const meta = getTxMeta({
        action: 'lockPosition',
        values: {
          position: shortenAddress(position.nftMint.toBase58())
        }
      })

      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({
            txId,
            ...meta,
            signedTx,
            mintInfo: [poolInfo.mintA, poolInfo.mintB],
            onSent: () => {
              txProps.onSent?.(extInfo as ClmmLockAddress)
            },
            onClose: txProps.onCloseToast,
            onConfirmed: () => {
              txProps.onConfirmed?.()
              setTimeout(() => {
                useTokenAccountStore.setState({ refreshClmmPositionTag: Date.now() })
              }, 500)
            }
          })
          return txId
        })
        .catch((e) => {
          txProps.onError?.()
          toastSubject.next({ txError: e, ...meta })
          return ''
        })
        .finally(() => {
          txProps.onFinally?.(extInfo as ClmmLockAddress)
        })
    },

    harvestLockPositionAct: async ({ lockData, poolInfo, needRefresh, onConfirmed, ...txProps }) => {
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium) return ''
      const computeBudgetConfig = await getComputeBudgetConfig()
      const { execute } = await raydium.clmm.harvestLockPosition({
        // programId: useAppStore.getState().programIdConfig.CLMM_LOCK_PROGRAM_ID,
        // authProgramId: useAppStore.getState().programIdConfig.CLMM_LOCK_AUTH_ID,
        // ownerPosition: position,
        lockData,
        txVersion,
        computeBudgetConfig
      })

      const meta = getTxMeta({
        action: 'harvest',
        values: {
          symbolA: getMintSymbol({ mint: poolInfo.mintA, transformSol: true }),
          symbolB: getMintSymbol({ mint: poolInfo.mintB, transformSol: true })
        }
      })

      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({
            txId,
            ...meta,
            mintInfo: [poolInfo.mintA, poolInfo.mintB],
            signedTx,
            ...txProps,
            onConfirmed: () => {
              onConfirmed?.()
              if (needRefresh) setTimeout(() => useTokenAccountStore.setState({ refreshClmmPositionTag: Date.now() }), 500)
            }
          })
          return txId
        })
        .catch((e) => {
          txProps.onError?.(e)
          toastSubject.next({ txError: e, ...meta })
          return ''
        })
        .finally(txProps.onFinally)
    },

    setRewardsAct: async ({ poolInfo, poolKeys, rewardInfos, newRewardInfos, onConfirmed, ...txProps }) => {
      const { raydium, txVersion } = useAppStore.getState()
      if (!raydium || rewardInfos.length + newRewardInfos.length < 1) return ''

      const meta = getTxMeta({
        action: 'updateRewards',
        values: {
          pool: `${poolInfo.mintA.symbol}/${poolInfo.mintB.symbol} (${toPercentString(poolInfo.feeRate * 100)})`
        }
      })
      const computeBudgetConfig = await getComputeBudgetConfig()

      if (rewardInfos.length && newRewardInfos.length) {
        const setRewardsBuildData = await raydium.clmm.setRewards({
          poolInfo,
          poolKeys,
          ownerInfo: { useSOLBalance: true },
          rewardInfos,
          txVersion
        })

        const initRewardBuildData = await raydium.clmm.initRewards({
          poolInfo,
          ownerInfo: { useSOLBalance: true },
          checkCreateATAOwner: true,
          rewardInfos: newRewardInfos,
          txVersion
        })

        const builder0 = setRewardsBuildData.builder
        builder0.addInstruction(initRewardBuildData.builder.AllTxData)
        builder0.addCustomComputeBudget(computeBudgetConfig)

        const txBuild = await builder0.versionBuild({ txVersion })
        if (!txBuild) {
          txProps.onError?.('build call data failed')
          txProps.onFinally?.()
          return ''
        }
        const mints = new Map()
        rewardInfos.forEach((r) => mints.set(r.mint.address, r.mint))
        newRewardInfos.forEach((r) => mints.set(r.mint.address, r.mint))
        return txBuild
          .execute()
          .then(({ txId }) => {
            txStatusSubject.next({ txId, ...txProps, ...meta, mintInfo: Array.from(mints.values()) })
            return txId
          })
          .catch((e) => {
            txProps.onError?.(e)
            toastSubject.next({ txError: e, ...meta })
            return ''
          })
          .finally(txProps.onFinally)
      }
      if (rewardInfos.length && !newRewardInfos.length) {
        const setRewardsBuildData = await raydium.clmm.setRewards({
          poolInfo,
          poolKeys,
          ownerInfo: { useSOLBalance: true },
          rewardInfos,
          computeBudgetConfig,
          txVersion
        })
        return setRewardsBuildData
          .execute()
          .then(({ txId, signedTx }) => {
            txStatusSubject.next({ txId, ...meta, signedTx, mintInfo: newRewardInfos.map((r) => r.mint), onConfirmed })
            return txId
          })
          .catch((e) => {
            txProps.onError?.(e)
            toastSubject.next({ txError: e, ...meta })
            return ''
          })
          .finally(txProps.onFinally)
      }
      if (!rewardInfos.length && newRewardInfos.length) {
        const initRewardBuildData = await raydium.clmm.initRewards({
          poolInfo,
          ownerInfo: { useSOLBalance: true },
          checkCreateATAOwner: true,
          rewardInfos: newRewardInfos,
          computeBudgetConfig,
          txVersion
        })

        return initRewardBuildData
          .execute()
          .then(({ txId }) => {
            txStatusSubject.next({ txId, ...meta, mintInfo: rewardInfos.map((r) => r.mint), onConfirmed })
            return txId
          })
          .catch((e) => {
            txProps.onError?.(e)
            toastSubject.next({ txError: e, ...meta })
            return ''
          })
          .finally(txProps.onFinally)
      }
      return ''
    },

    createClmmPool: async ({ token1, token2, config, price, execute, forerunCreate, getObserveState }) => {
      const { raydium, publicKey, txVersion } = useAppStore.getState()
      if (!raydium || !publicKey) {
        toastSubject.next({ noRpc: true })
        return { txId: '' }
      }
      try {
        const computeBudgetConfig = forerunCreate ? undefined : await getComputeBudgetConfig()
        const buildData = await raydium.clmm.createPool({
          programId: PancakeClmmProgramId['mainnet-beta'],
          mint1: { ...token1, address: token1.address },
          mint2: { ...token2, address: token2.address },
          ammConfig: { ...config, id: new PublicKey(config.id), fundOwner: '', description: '' },
          initialPrice: new Decimal(price),
          computeBudgetConfig,
          forerunCreate,
          getObserveState,
          txVersion
        })
        const { execute: executeTx } = buildData
        if (execute) {
          const meta = getTxMeta({
            action: 'createPool',
            values: {}
          })

          return executeTx()
            .then(({ txId, signedTx }) => {
              txStatusSubject.next({ txId, ...meta, signedTx, mintInfo: [token1, token2] })
              return { txId, buildData }
            })
            .catch((e) => {
              toastSubject.next({ txError: e, ...meta })
              return { txId: '' }
            })
        }
        return { txId: '', buildData }
      } catch (e: any) {
        toastSubject.next({
          status: 'error',
          title: 'Error',
          description: e.message.includes('byte array longer than') ? 'Current price out of range' : e.message
        })
        return { txId: '' }
      }
    },

    createFarm: async ({ poolInfo, rewardInfos, onSent, onError, onFinally, onConfirmed }) => {
      const { raydium, publicKey, txVersion } = useAppStore.getState()
      if (!raydium || !publicKey) return ''
      const { execute } = await raydium.clmm.initRewards({
        poolInfo,
        poolKeys: {
          mintA: poolInfo.mintA,
          mintB: poolInfo.mintB,
          // programId: poolInfo.programId || PancakeClmmProgramId,
          config: poolInfo.config,
          vault: (poolInfo as any).vault,
          id: poolInfo.id,
          programId: poolInfo.programId,
          openTime: '1723037622'
        } as any,
        rewardInfos: rewardInfos.map((r) => ({
          ...r,
          mint: solToWSolToken(r.mint)
        })),
        ownerInfo: {
          useSOLBalance: true
        },
        checkCreateATAOwner: true,
        txVersion
      })

      const meta = getTxMeta({
        action: 'createFarm',
        values: { poolId: `${poolInfo.id.slice(0, 4)}...${poolInfo.id.slice(-4)}` }
      })
      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({ txId, ...meta, signedTx, mintInfo: rewardInfos.map((r) => r.mint), onConfirmed })
          onSent?.()
          return txId
        })
        .catch((e) => {
          toastSubject.next({ txError: e, ...meta })
          onError?.(e)
          return ''
        })
        .finally(onFinally)
    },

    fetchAmmConfigsAct: async () => {
      // const { raydium } = useAppStore.getState()
      // if (Object.keys(get().clmmFeeConfigs).length || !raydium) return
      set({ clmmFeeConfigs: ammConfigs['mainnet-beta'] }, false, { type: 'fetchAmmConfigsAct' })
      // try {
      //   // const res = await raydium.api.getClmmConfigs()
      //   // const apiRes = res.reduce(
      //   //   (acc, cur) => ({
      //   //     ...acc,
      //   //     [cur.id]: cur
      //   //   }),
      //   //   {}
      //   // )
      //   set({ clmmFeeConfigs:  }, false, { type: 'fetchAmmConfigsAct' })
      // } catch {
      //   set({ clmmFeeConfigs: CLMM_FEE_CONFIGS }, false, { type: 'fetchAmmConfigsAct' })
      // }
    },

    // store related utils
    convertPoolPrice: ({ pool, price }) => {
      const p = new Decimal(price ?? '0').clamp(
        1 / 10 ** Math.max(pool.mintA?.decimals ?? 0, pool.mintB?.decimals ?? 0, new Decimal(price).decimalPlaces()),
        Number.MAX_SAFE_INTEGER
      )
      return new Price({
        baseToken: toToken(pool.mintA),
        denominator: new BN(10).pow(new BN(20 + pool.mintA!.decimals)),
        quoteToken: toToken(pool.mintB),
        numerator: p.mul(new Decimal(10 ** (20 + pool.mintB!.decimals))).toFixed(0)
      })
    },
    getPriceAndTick: ({ pool, price, baseIn }) => {
      if (!pool) return
      try {
        const p = new Decimal(price || '0').clamp(1 / 10 ** Math.max(pool.mintA.decimals, pool.mintB.decimals), Number.MAX_SAFE_INTEGER)
        return TickUtils.getPriceAndTick({
          poolInfo: pool,
          price: p,
          baseIn
        })
      } catch (e: any) {
        toastSubject.next({
          status: 'error',
          title: 'error',
          description: e.message.includes('not within the supported sqrtPrice range') ? 'Price for tick overflow' : e.message
        })
      }
    },
    getTickPrice: ({ pool, tick, baseIn }) => {
      if (!pool) return
      try {
        return TickUtils.getTickPrice({
          poolInfo: pool,
          tick,
          baseIn
        })
      } catch (e: any) {
        toastSubject.next({
          status: 'error',
          title: 'error',
          description: e.message
        })
      }
    },
    computePairAmount: async ({ pool, inputA, tickLower, tickUpper, amount }) => {
      const [connection, getEpochInfo] = [useAppStore.getState().connection, useAppStore.getState().getEpochInfo]
      const { slippage } = useLiquidityStore.getState()
      const poolInfo = pool
      const epochInfo = await getEpochInfo()
      if (!poolInfo || !connection || tickLower === undefined || tickLower === undefined || !epochInfo) {
        return
      }
      const [decimalA, decimalB] = [poolInfo.mintA?.decimals ?? 6, poolInfo.mintB?.decimals ?? 6]
      const res = PoolUtils.getLiquidityAmountOutFromAmountIn({
        poolInfo,
        slippage: 0,
        inputA,
        tickUpper: Math.max(tickLower, tickUpper!),
        tickLower: Math.min(tickLower, tickUpper!),
        amount: new BN(new Decimal(amount || '0').mul(10 ** (inputA ? decimalA : decimalB)).toFixed(0)),
        add: true,
        amountHasFee: true,
        epochInfo: epochInfo!
      })
      return {
        amountA: new Decimal(res.amountA.amount.toString()).div(10 ** decimalA),
        amountSlippageA: new Decimal(res.amountSlippageA.amount.toString()).mul(1 + slippage).div(10 ** decimalA),
        amountB: new Decimal(res.amountB.amount.toString()).div(10 ** decimalB),
        amountSlippageB: new Decimal(res.amountSlippageB.amount.toString()).mul(1 + slippage).div(10 ** decimalB),
        liquidity: res.liquidity,
        calResult: res
      }
    },
    loadAddRewardWhiteListAct: async (props) => {
      const { raydium } = useAppStore.getState()
      if (!raydium) return ''
      const { checkFetch } = props || {}
      if (checkFetch && get().rewardWhiteListMints.length > 0) return
      raydium.clmm.getWhiteListMint({ programId: useAppStore.getState().programIdConfig.CLMM_PROGRAM_ID }).then((data) => {
        set({ rewardWhiteListMints: data }, false, { type: 'loadAddRewardWhiteListAct' })
      })
    },
    loadOperationOwnersAct: async (props) => {
      const { raydium } = useAppStore.getState()
      if (!raydium) return ''
      const { checkFetch } = props || {}
      if (checkFetch && get().operationOwners.length > 0) return
      raydium.clmm.getOperationOwners({ programId: useAppStore.getState().programIdConfig.CLMM_PROGRAM_ID }).then((data) => {
        set({ operationOwners: data }, false, { type: 'loadOperationOwnersAct' })
      })
    },
    reset: () => set(clmmInitState)
  }),
  'useClmmStore'
)
