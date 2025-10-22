import { ChainId, isSolana, NonEVMChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/sdk'
import memoize from 'lodash/memoize'
import { safeGetAddress } from 'utils'
import { isAddress } from 'viem'

const mapping = {
  [ChainId.BSC]: 'smartchain',
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.ZKSYNC]: 'zksync',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.LINEA]: 'linea',
  [ChainId.BASE]: 'base',
  [NonEVMChainId.SOLANA]: 'solana',
}

const getTokenLogoURL = memoize(
  (token?: Token) => {
    if (token && mapping[token.chainId] && isAddress(token.address)) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[token.chainId]}/assets/${
        isSolana(token.chainId) ? token.address : safeGetAddress(token.address)
      }/logo.png`
    }
    return null
  },
  (t) => `${t?.chainId}#${t?.address}`,
)

export const getTokenLogoURLByAddress = memoize(
  (address?: string, chainId?: number) => {
    if (address && chainId && mapping[chainId] && isAddress(address)) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${safeGetAddress(
        address,
      )}/logo.png`
    }
    return null
  },
  (address, chainId) => `${chainId}#${address}`,
)

export default getTokenLogoURL
