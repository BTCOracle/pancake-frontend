// TODO: Using IFO v10 ABI for testing
// import { ifoABI } from 'config/abi/ifo'
import { getContract } from 'utils/contractHelpers'
import { Address, createPublicClient, custom, http, isAddress, type WalletClient } from 'viem'
import { bsc } from 'viem/chains'
import { getViemClients } from 'utils/viem'
import { IFOConfig } from 'views/Cakepad/ifov2.types'
import { ifoV10Abi as ifoABI } from '../../abi/ifoV10Abi'

function getIfoAddressFromUrl(): `0x${string}` | null {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') return null

  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('testIfoAddress') as `0x${string}` | null
  }

  return process.env.NEXT_PUBLIC_BSC_TESTNET_IFO_ADDRESS as `0x${string}` | null
}

function getIFOAddress(ifoId: string, ifoConfigs: IFOConfig[]): `0x${string}` {
  const contractAddressFromQuery = getIfoAddressFromUrl()
  if (contractAddressFromQuery && isAddress(contractAddressFromQuery)) {
    return contractAddressFromQuery
  }
  const ifoConfig = ifoConfigs.find((x) => x.id === ifoId)
  return ifoConfig!.contractAddress
}

export function getIFOContract(
  ifoId: string,
  ifoConfigs: IFOConfig[],
  signer?: WalletClient,
  chainId?: number,
  ca?: Address,
) {
  const ifoAddress = getIFOAddress(ifoId, ifoConfigs)
  const publicClient = getViemClients({ chainId })
  return getContract({
    address: ca || ifoAddress,
    abi: ifoABI,
    signer,
    chainId,
    publicClient,
  })
}
