import { ChainId } from '@pancakeswap/chains'
import { CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { useAllTokens } from 'hooks/Tokens'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCallback } from 'react'
import { checksumAddress } from 'utils/checksumAddress'
import { zeroAddress } from 'viem'
import { GiftInfo, GiftInfoResponse } from '../types'

export default function useGiftInfoSelector() {
  const chainId = ChainId.BSC
  const native = useNativeCurrency(chainId)
  const allTokens = useAllTokens(chainId)

  return useCallback(
    (gift?: GiftInfoResponse): GiftInfo | null => {
      // Why null?
      // Because we want to differentiate between gift is not loaded and gift is invalid
      // if gift is undefined, it means the gift is not loaded yet
      // if gift is null, it means the gift is invalid
      if (!gift) {
        return null
      }

      const tokenAddress = checksumAddress(gift.token as `0x${string}`)

      const isNative = tokenAddress === zeroAddress

      let currencyAmount: CurrencyAmount<Token> | undefined | null

      if (isNative) {
        currencyAmount = null
      } else {
        const token = allTokens[tokenAddress]
        currencyAmount = token ? CurrencyAmount.fromRawAmount(token, gift.tokenAmount) : undefined
      }

      try {
        return {
          ...gift,
          token: tokenAddress,
          currencyAmount,
          nativeCurrencyAmount: CurrencyAmount.fromRawAmount(native, gift.nativeAmount),
        }
      } catch (error) {
        console.error(error)
        return null
      }
    },
    [native, allTokens],
  )
}
