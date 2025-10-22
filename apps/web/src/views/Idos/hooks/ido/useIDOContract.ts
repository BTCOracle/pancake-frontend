import { idoABI } from 'config/abi/ido'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { getContract } from 'utils/contractHelpers'
import { createPublicClient, custom, http, isAddress, type WalletClient } from 'viem'
import { bsc } from 'viem/chains'
import { idoConfigDict } from 'views/Idos/config'
import { useWalletClient } from 'wagmi'

export const useIDOContract = () => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  const { query } = useRouter()
  const idoId = query.ido as string

  return useMemo(() => getIDOContract(idoId, signer ?? undefined, chainId), [chainId, signer, idoId])
}

function getIdoAddressFromUrl(): `0x${string}` | null {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') return null

  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('testIdoAddress') as `0x${string}` | null
  }

  return process.env.NEXT_PUBLIC_BSC_TESTNET_IDO_ADDRESS as `0x${string}` | null
}

function getIDOAddress(idoId: string): `0x${string}` {
  const contractAddressFromQuery = getIdoAddressFromUrl()
  if (contractAddressFromQuery && isAddress(contractAddressFromQuery)) {
    return contractAddressFromQuery
  }
  return idoConfigDict[idoId]?.contractAddress
}

function getIDOContract(idoId: string, signer?: WalletClient, chainId?: number) {
  const idoAddress = getIDOAddress(idoId)
  return getContract({
    address: idoAddress,
    abi: idoABI,
    signer,
    chainId,
    publicClient: createPublicClient({
      chain: bsc,
      transport: typeof window !== 'undefined' && window.ethereum ? custom(window.ethereum as any) : http(),
    }),
  })
}
