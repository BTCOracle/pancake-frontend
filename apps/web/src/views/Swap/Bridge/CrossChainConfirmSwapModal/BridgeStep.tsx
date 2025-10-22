import { isSolana } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { useUnifiedCurrency } from 'hooks/Tokens'

export const BridgeStep = ({
  originChainId,
  destinationChainId,
  originTokenAddress,
  destinationTokenAddress,
}: {
  originChainId: number
  destinationChainId: number
  originTokenAddress: string
  destinationTokenAddress: string
}) => {
  const inCurrency = useUnifiedCurrency(originTokenAddress, originChainId)
  const outCurrency = useUnifiedCurrency(destinationTokenAddress, destinationChainId)

  const { t } = useTranslation()

  if (isSolana(originChainId) || isSolana(destinationChainId)) {
    return t('Swap %currencyA% (%chainNameA%) to %currencyB% (%chainName%)', {
      currencyA: inCurrency?.symbol || '',
      chainNameA: getFullChainNameById(inCurrency?.chainId),
      currencyB: outCurrency?.symbol,
      chainName: getFullChainNameById(outCurrency?.chainId),
    })
  }

  return t('Bridge %currency% (%inputChain% to %outputChain%)', {
    currency: inCurrency?.symbol,
    inputChain: getFullChainNameById(inCurrency?.chainId),
    outputChain: getFullChainNameById(outCurrency?.chainId),
  })
}
