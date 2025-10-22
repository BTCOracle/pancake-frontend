import { SmartRouter } from '@pancakeswap/smart-router'
import { createViemPublicClientGetter } from 'utils/viem'
import { CreateQuoteProviderParams } from '../quoter.types'

export function createQuoteProvider({ gasLimit, signal }: CreateQuoteProviderParams) {
  const onChainProvider = createViemPublicClientGetter({ transportSignal: signal })
  return SmartRouter.createQuoteProvider({ onChainProvider, gasLimit })
}
