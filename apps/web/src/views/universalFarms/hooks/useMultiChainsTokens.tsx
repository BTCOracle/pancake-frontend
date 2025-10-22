import { ChainId, ERC20Token, SPLToken } from '@pancakeswap/sdk'
import { isEvm, NonEVMChainId } from '@pancakeswap/chains'
import type { TokenInfo } from '@pancakeswap/token-lists'
import {
  PANCAKE_ARB_DEFAULT,
  PANCAKE_BASE_DEFAULT,
  PANCAKE_ETH_DEFAULT,
  PANCAKE_EXTENDED,
  PANCAKE_LINEA_DEFAULT,
  PANCAKE_OPBNB_DEFAULT,
  PANCAKE_SOLANA_DEFAULT,
  PANCAKE_ZKSYNC_DEFAULT,
} from 'config/constants/lists'
import { useAtom } from 'jotai'
import flatMap from 'lodash/flatMap'
import { useMemo } from 'react'
import { selectorByUrlsAtom } from 'state/lists/hooks'

const BSC_URLS = [PANCAKE_EXTENDED]
const ETH_URLS = [PANCAKE_ETH_DEFAULT]
const ZKSYNC_URLS = [PANCAKE_ZKSYNC_DEFAULT]
const ARBITRUM_URLS = [PANCAKE_ARB_DEFAULT]
const LINEA_URLS = [PANCAKE_LINEA_DEFAULT]
const BASE_URLS = [PANCAKE_BASE_DEFAULT]
const OPBNB_URLS = [PANCAKE_OPBNB_DEFAULT]
const SOLANA_URLS = [PANCAKE_SOLANA_DEFAULT]

export const MULTI_CHAIN_LIST_URLS: { [chainId: number]: string[] } = {
  [ChainId.BSC]: BSC_URLS,
  [ChainId.ETHEREUM]: ETH_URLS,
  [ChainId.ZKSYNC]: ZKSYNC_URLS,
  [ChainId.ARBITRUM_ONE]: ARBITRUM_URLS,
  [ChainId.LINEA]: LINEA_URLS,
  [ChainId.BASE]: BASE_URLS,
  [ChainId.OPBNB]: OPBNB_URLS,
  [NonEVMChainId.SOLANA]: SOLANA_URLS,
}

export const useTokensFromUrls = (urls: string[]) => {
  const [lists] = useAtom(selectorByUrlsAtom)
  return useMemo(() => {
    const tokenInfos = flatMap(urls, (url) => lists[url]?.current?.tokens).filter(Boolean) as TokenInfo[]
    return tokenInfos.map(({ chainId, address, decimals, symbol, name, logoURI, programId }) =>
      isEvm(chainId)
        ? new ERC20Token(chainId, address, decimals, symbol, name)
        : new SPLToken({
            chainId,
            address,
            decimals,
            symbol,
            name,
            logoURI: logoURI ?? '',
            programId: programId ?? '',
          }),
    )
  }, [lists, urls])
}
