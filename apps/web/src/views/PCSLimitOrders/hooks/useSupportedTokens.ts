import { getCurrencyAddress, ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import { useTokensByChainId } from 'hooks/Tokens'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { supportedPoolsListAtom } from 'views/PCSLimitOrders/state/pools/poolsListAtom'
import { getTokensMap } from 'views/PCSLimitOrders/utils'
import { inputCurrencyAtom } from '../state/currency/currencyAtoms'

export const useSupportedTokens = () => {
  const { chainId } = useAccountActiveChain()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const supportedPoolsList = useAtomValue(supportedPoolsListAtom)

  // Supported tokens bi-directional map
  const tokenMap = useMemo(
    () => getTokensMap(supportedPoolsList.filter((pool) => pool.chainId === chainId)),
    [supportedPoolsList, chainId],
  )

  const supportedTokens = useMemo(() => {
    let isNativeInputSupported = false
    let isNativeOutputSupported = false

    let inputTokenAddresses = Object.keys(tokenMap) ?? []
    let outputTokenAddresses = inputCurrency ? tokenMap[getCurrencyAddress(inputCurrency)] ?? [] : []

    const zeroAddressInputIndex = inputTokenAddresses.indexOf(ZERO_ADDRESS)
    if (zeroAddressInputIndex !== -1) {
      inputTokenAddresses = inputTokenAddresses.toSpliced(zeroAddressInputIndex, 1)
      isNativeInputSupported = true
    }

    const zeroAddressOutputIndex = outputTokenAddresses.indexOf(ZERO_ADDRESS)
    if (zeroAddressOutputIndex !== -1) {
      outputTokenAddresses = outputTokenAddresses.toSpliced(zeroAddressOutputIndex, 1)
      isNativeOutputSupported = true
    }

    return {
      inputTokenAddresses,
      outputTokenAddresses,
      isNativeInputSupported,
      isNativeOutputSupported,
    }
  }, [tokenMap, inputCurrency])

  const inputTokensMap = useTokensByChainId(supportedTokens.inputTokenAddresses, chainId)
  const outputTokensMap = useTokensByChainId(supportedTokens.outputTokenAddresses, chainId)

  const inputTokens = useMemo(() => Object.values(inputTokensMap).filter((item) => !!item) ?? [], [inputTokensMap])
  const outputTokens = useMemo(() => Object.values(outputTokensMap).filter((item) => !!item) ?? [], [outputTokensMap])

  return useMemo(
    () => ({
      isNativeInputSupported: supportedTokens.isNativeInputSupported,
      isNativeOutputSupported: supportedTokens.isNativeOutputSupported,
      inputTokens,
      outputTokens,
    }),
    [supportedTokens.isNativeInputSupported, supportedTokens.isNativeOutputSupported, inputTokens, outputTokens],
  )
}
