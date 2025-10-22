import { isEvm, NonEVMChainId } from '@pancakeswap/chains'
import { FarmV4SupportedChainId, Protocol } from '@pancakeswap/farms'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'

const HEX_ADDRESS_REG = /^0x[a-zA-Z0-9]{40,64}$/
const SOL_ADDRESS_REG = /^[1-9A-Za-z]{32,44}$/

export const isAddressKeyword = (keyword: string) => HEX_ADDRESS_REG.test(keyword) || SOL_ADDRESS_REG.test(keyword)

function parseTokenExtendSearch(
  keywords: string,
  protocols: Protocol[],
  chains: FarmV4SupportedChainId[],
  sortBy: FarmQuery['sortBy'],
): FarmQuery[] {
  const symbols = keywords
    .trim()
    .split(/(\s+|,|-|\/)/)
    .map((x) => x.trim())
    .filter((x) => x && !isAddressKeyword(x))
    .slice(0, 3)

  return [
    {
      protocols,
      chains,
      symbols,
      sortBy,
    },
  ].filter((x) => x.symbols && x.symbols.length > 0)
}

const parseFarmSearchAddress = (
  keywords: string,
  protocols: Protocol[],
  chains: FarmV4SupportedChainId[],
  sortBy: FarmQuery['sortBy'],
): FarmQuery[] => {
  const trimmedKeyword = keywords.trim()
  if (isAddressKeyword(trimmedKeyword)) {
    const filteredChains = SOL_ADDRESS_REG.test(keywords)
      ? [NonEVMChainId.SOLANA]
      : chains.filter((chain) => isEvm(chain))
    return [
      {
        protocols,
        tokens: filteredChains.map((chain) => `${chain}:${trimmedKeyword}`),
        chains,
        sortBy,
      },
    ].filter((x) => x.tokens && x.tokens.length > 0)
  }
  return []
}

const parseQueryChain = (
  chains: FarmV4SupportedChainId[],
  protocols: Protocol[],
  sortBy: FarmQuery['sortBy'],
): FarmQuery[] => {
  if (chains.length === 0) {
    return []
  }
  return [
    {
      protocols,
      chains,
      sortBy,
    },
  ]
}

export const parseExtendSearchParams = (
  keywords: string,
  protocols: Protocol[],
  chains: FarmV4SupportedChainId[],
  sortBy: FarmQuery['sortBy'],
) => {
  if (!keywords || keywords.trim().length === 0) {
    return []
  }

  const addressParams = parseFarmSearchAddress(keywords, protocols, chains, sortBy)
  const tokenParams = parseTokenExtendSearch(keywords, protocols, chains, sortBy)
  const chainParams = parseQueryChain(chains, protocols, sortBy)

  return [...chainParams, ...addressParams, ...tokenParams]
}
