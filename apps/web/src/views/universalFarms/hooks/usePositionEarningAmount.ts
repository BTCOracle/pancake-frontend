import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'
import { Address } from 'viem/accounts'

type EarningAmountType = {
  [chainId: number]: {
    [poolId: Address]:
      | number
      | {
          [tokenId: number]: number
        }
  }
}

export const positionEarningAmountAtom = atom<EarningAmountType>({})

export const usePositionEarningAmount = () => {
  const [value, setValue] = useAtom(positionEarningAmountAtom)

  const setEarningAmount = useCallback(
    (chainId: number, poolId: Address, tokenIdOrAmount: number | bigint, amount_?: number) => {
      const amount = amount_ ?? Number(tokenIdOrAmount)
      if (typeof amount === 'undefined') {
        return
      }
      setValue((prev) => {
        const newValue = { ...prev }

        if (!newValue[chainId]) {
          newValue[chainId] = {}
        }

        if (typeof amount_ === 'undefined') {
          newValue[chainId][poolId] = amount
        } else {
          if (typeof newValue[chainId][poolId] !== 'object') {
            newValue[chainId][poolId] = {}
          }

          newValue[chainId][poolId][tokenIdOrAmount.toString()] = amount
        }

        return newValue
      })
    },
    [setValue],
  )

  return [value, setEarningAmount] as const
}
