import { ChainId } from '@pancakeswap/chains'
import { OnChainProvider, SmartRouter } from '@pancakeswap/smart-router'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { getTokenByAddress } from '@pancakeswap/tokens'
import { memoizeAsync } from '@pancakeswap/utils/memoize'
import { erc20Abi } from 'viem'
import { Address } from 'viem/accounts'
import { safeGetAddress } from './safeGetAddress'
import { getViemClients } from './viem'

export const mockCurrency = memoizeAsync(
  async (address: Address, chainId: ChainId, provider?: OnChainProvider) => {
    const token = getTokenByAddress(chainId, address)
    if (token) {
      return SmartRouter.Transformer.parseCurrency(chainId, {
        address,
        decimals: token.decimals,
        symbol: token.symbol,
      })
    }
    const onChainToken = await getToken(address, chainId, provider)
    if (onChainToken) {
      return onChainToken
    }

    return SmartRouter.Transformer.parseCurrency(chainId, {
      address,
      decimals: 18,
      symbol: '',
    })
  },
  {
    resolver: (address, chainId) => {
      return `${address.toLowerCase()}-${chainId}`
    },
  },
)

async function getToken(address: Address, chainId: ChainId, provider?: OnChainProvider): Promise<Currency | undefined> {
  const client = (provider || getViemClients)({ chainId })
  const checksumAddress = safeGetAddress(address)
  if (!checksumAddress || !client) {
    return undefined
  }
  const result = await client.multicall({
    contracts: [
      { address: checksumAddress, abi: erc20Abi, functionName: 'decimals' },
      { address: checksumAddress, abi: erc20Abi, functionName: 'symbol' },
    ],
  })
  const [decimals, symbol] = result.map((x) => x.result) as [number, string, string]
  return SmartRouter.Transformer.parseCurrency(chainId, {
    address: checksumAddress,
    decimals,
    symbol,
  })
}
