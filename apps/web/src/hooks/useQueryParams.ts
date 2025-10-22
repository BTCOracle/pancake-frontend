import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from 'nuqs'

// chainId and chain may conflict with the users active chain
export const useQueryChainId = () => useQueryState('selectedChainId', parseAsInteger.withDefault(56))

interface UseQueryCurrencyPairParams {
  defaultCurrencyA?: string
  defaultCurrencyB?: string
}
export const useQueryCurrencyPair = ({
  defaultCurrencyA = '',
  defaultCurrencyB = '',
}: UseQueryCurrencyPairParams = {}) => {
  //   return useQueryState('currency', parseAsArrayOf(parseAsString).withDefault([]))
  return useQueryStates({
    currencyA: parseAsString.withDefault(defaultCurrencyA),
    currencyB: parseAsString.withDefault(defaultCurrencyB),
  })
}
