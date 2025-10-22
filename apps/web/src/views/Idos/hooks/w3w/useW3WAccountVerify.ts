import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem/accounts'
import { useAccount } from 'wagmi'

interface W3WVerifyResponse {
  code: string
  success: boolean
  data: boolean
}

export enum VerifyStatus {
  ineligible = 'ineligible',
  eligible = 'eligible',
  restricted = 'restricted',
  snapshotNotPass = 'snapshot-not-pass',
}

const verifyW3WAccount = async (address: Address): Promise<{ status: VerifyStatus; code: string }> => {
  try {
    const timestamp = Date.now()
    // let response: Response
    // try {
    //   response = await fetch(
    //     `https://www.binance.com/bapi/defi/v1/public/wallet-direct/wallet/address/verify?address=${address}&timestamp=${timestamp}`,
    //     {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'x-gray-env': 'infra',
    //       },
    //     },
    //   )
    // } catch (error) {
    //   console.error('Error verifying W3W account:', error)
    //   response = await fetch(`/api/w3w/verify?address=${address}&timestamp=${timestamp}`)
    // }
    const response = await fetch(`/api/w3w/verify?address=${address}&timestamp=${timestamp}`)
    const result: W3WVerifyResponse = await response.json()

    if (result?.code === '351083') {
      return { status: VerifyStatus.restricted, code: result.code }
    }

    if (result?.code === '351090') {
      return { status: VerifyStatus.snapshotNotPass, code: result.code }
    }

    if (result.code === '000000' && result.success && result.data) {
      return { status: VerifyStatus.eligible, code: result.code }
    }

    return { status: VerifyStatus.ineligible, code: result.code }
  } catch (error) {
    console.error('Error verifying W3W account:', error)
    return { status: VerifyStatus.ineligible, code: 'error' }
  }
}

export const useW3WAccountVerify = () => {
  const { address } = useAccount()

  const { data, isLoading, error } = useQuery({
    queryKey: ['w3w-account-verify', address],
    queryFn: async () => {
      if (!address) throw new Error('No address provided')
      return verifyW3WAccount(address)
    },
    enabled: !!address,
  })

  return {
    verifyStatus: data?.status,
    verifyCode: data?.code,
    isLoading,
    error,
  }
}
