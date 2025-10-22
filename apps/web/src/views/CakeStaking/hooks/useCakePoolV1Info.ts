import { ChainId } from '@pancakeswap/chains'
import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useCakeVaultV1Contract } from 'hooks/useContract'

export type CakePoolV1Info = {
  shares: bigint
  pricePerFullShare: bigint
  performanceFee: bigint
}

export const useCakePoolV1Info = (targetChain?: ChainId) => {
  const { chainId, account } = useAccountActiveChain()
  const cakeVaultContract = useCakeVaultV1Contract(targetChain)
  const chainIdTarget = targetChain || chainId

  const { data: info } = useQuery({
    queryKey: ['cakePoolV1LockInfo', cakeVaultContract.address, chainIdTarget, account],

    queryFn: async (): Promise<CakePoolV1Info> => {
      if (!account) return {} as CakePoolV1Info
      const [shares] = await cakeVaultContract.read.userInfo([account])
      const pricePerFullShare = await cakeVaultContract.read.getPricePerFullShare()
      const performanceFee = await cakeVaultContract.read.performanceFee()
      return {
        shares,
        performanceFee,
        pricePerFullShare,
      }
    },

    enabled: Boolean(account) && (chainId === ChainId.BSC || chainId === ChainId.BSC_TESTNET),
  })
  return info || ({} as CakePoolV1Info)
}
