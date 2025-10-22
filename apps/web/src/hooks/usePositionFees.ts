import { BinPositionManagerAbi, CLPositionManagerAbi } from '@pancakeswap/infinity-sdk'
import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import { useEffect, useMemo, useState } from 'react'
import { useCurrentBlock } from 'state/block/hooks'
import { useSingleCallResult } from 'state/multicall/hooks'
import { Address } from 'viem'

import { useContract } from './useContract'

const MAX_UINT128 = 2n ** 128n - 1n

// compute current + counterfactual fees for a v3 position
export function usePositionFees({
  tokenId,
  asWNATIVE = false,
  positionManagerAddress,
  abi,
  currency0,
  currency1,
}: {
  tokenId?: bigint
  asWNATIVE?: boolean
  positionManagerAddress: Address
  abi: typeof nonfungiblePositionManagerABI | typeof CLPositionManagerAbi | typeof BinPositionManagerAbi
  currency0?: Currency
  currency1?: Currency
}): [CurrencyAmount<Currency>, CurrencyAmount<Currency>] | [undefined, undefined] {
  const positionManager = useContract(positionManagerAddress, abi)
  const owner = useSingleCallResult({
    contract: tokenId ? positionManager : null,
    functionName: 'ownerOf',
    args: useMemo(() => [tokenId!] as const, [tokenId]),
  }).result

  const latestBlockNumber = useCurrentBlock()

  // we can't use multicall for this because we need to simulate the call from a specific address
  // latestBlockNumber is included to ensure data stays up-to-date every block
  const [amounts, setAmounts] = useState<[bigint, bigint] | undefined>()
  useEffect(() => {
    if (positionManager && typeof tokenId !== 'undefined' && owner) {
      positionManager.simulate
        .collect(
          [
            {
              tokenId,
              recipient: owner, // some tokens might fail if transferred to address(0)
              amount0Max: MAX_UINT128,
              amount1Max: MAX_UINT128,
            },
          ],
          { account: owner, value: 0n }, // need to simulate the call as the owner
        )
        .then((results) => {
          const [amount0, amount1] = results.result
          setAmounts([amount0, amount1])
        })
    }
  }, [positionManager, owner, latestBlockNumber, tokenId])

  if (currency0 && currency1 && amounts) {
    return [
      CurrencyAmount.fromRawAmount(asWNATIVE ? currency0.wrapped : currency0, amounts[0].toString()),
      CurrencyAmount.fromRawAmount(asWNATIVE ? currency1.wrapped : currency1, amounts[1].toString()),
    ]
  }
  return [undefined, undefined]
}
