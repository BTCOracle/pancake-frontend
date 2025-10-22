import { useSetAtom } from 'jotai'
import { SolanaV3Pool, updateSolanaV3PoolAtom } from 'state/pools/solana'
import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { PoolInfoLayout, SqrtPriceMath } from '@pancakeswap/solana-core-sdk'
import { useSolanaConnectionWithRpcAtom } from './useSolanaConnectionWithRpcAtom'

export const useSolanaV3PoolsUpdater = (
  poolInfos: SolanaV3Pool[] | undefined | null,
  options?: {
    initialFetch?: boolean
    enabledSubscribe?: boolean
  },
) => {
  const connection = useSolanaConnectionWithRpcAtom()
  const updateSolanaV3Pool = useSetAtom(updateSolanaV3PoolAtom)
  const { initialFetch = true, enabledSubscribe = true } = options || {}
  const [isInitialFetched, setIsInitialFetched] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!connection || !poolInfos || poolInfos.length === 0 || !initialFetch || isInitialFetched || loading) return
    setLoading(true)

    const fetchPoolInfoFromRpc = async (poolInfo: SolanaV3Pool) => {
      try {
        const accountInfo = await connection.getAccountInfo(new PublicKey(poolInfo.id))
        if (!accountInfo?.data) return
        const info = PoolInfoLayout.decode(accountInfo.data)
        const currentPrice = SqrtPriceMath.sqrtPriceX64ToPrice(
          info.sqrtPriceX64,
          poolInfo.mintA.decimals,
          poolInfo.mintB.decimals,
        )
        updateSolanaV3Pool({
          ...poolInfo,
          price: currentPrice.toDecimalPlaces(20).toNumber(),
          liquidity: BigInt(info.liquidity.toString()),
          tickCurrent: info.tickCurrent,
        })
      } catch (error) {
        console.error('fetchPoolInfoFromRpc error', error)
      }
    }
    Promise.all(poolInfos.map(fetchPoolInfoFromRpc)).finally(() => {
      setLoading(false)
      setIsInitialFetched(true)
    })
  }, [connection, poolInfos, initialFetch, isInitialFetched, updateSolanaV3Pool, loading])

  useEffect(() => {
    if (!connection || !poolInfos || !enabledSubscribe) return undefined

    const subs: number[] = []

    const createSubscribe = (poolInfo: SolanaV3Pool) => {
      const sub = connection.onProgramAccountChange(
        new PublicKey(poolInfo.programId),
        (data) => {
          const info = PoolInfoLayout.decode(data.accountInfo.data)
          if (data.accountId.toString() !== poolInfo.id) return
          const currentPrice = SqrtPriceMath.sqrtPriceX64ToPrice(
            info.sqrtPriceX64,
            poolInfo.mintA.decimals,
            poolInfo.mintB.decimals,
          )
          updateSolanaV3Pool({
            ...poolInfo,
            price: currentPrice.toDecimalPlaces(20).toNumber(),
            liquidity: BigInt(info.liquidity.toString()),
            tickCurrent: info.tickCurrent,
          })
        },
        'confirmed',
        [
          { dataSize: PoolInfoLayout.span },
          {
            memcmp: {
              offset: PoolInfoLayout.offsetOf('ammConfig'),
              bytes: poolInfo.config.id,
            },
          },
          {
            memcmp: {
              offset: PoolInfoLayout.offsetOf('mintA'),
              bytes: poolInfo.mintA.address,
            },
          },
          {
            memcmp: {
              offset: PoolInfoLayout.offsetOf('mintB'),
              bytes: poolInfo.mintB.address,
            },
          },
        ],
      )
      subs.push(sub)
    }

    poolInfos.forEach(createSubscribe)

    return () => {
      subs.forEach((sub) => connection.removeProgramAccountChangeListener(sub))
    }
  }, [connection, poolInfos, updateSolanaV3Pool])

  return {
    loading,
  }
}
