import { useTranslation } from '@pancakeswap/localization'
import { useUnifiedCurrency } from 'hooks/Tokens'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { BridgeStatus } from '../types'

export const SwapStep = ({
  status,
  originChainId,
  destinationChainId,
  originTokenAddress,
  destinationTokenAddress,
}: {
  status: BridgeStatus
  originChainId: number
  destinationChainId: number
  originTokenAddress: string
  destinationTokenAddress: string
}) => {
  const { t } = useTranslation()

  const inToken = useUnifiedCurrency(originTokenAddress, originChainId)
  const outToken = useUnifiedCurrency(destinationTokenAddress, destinationChainId)

  if (status === BridgeStatus.SUCCESS) {
    return t('Swapped %currencyA% to %currencyB% (%chainName%)', {
      currencyA: inToken?.symbol,
      currencyB: outToken?.symbol,
      chainName: getFullChainNameById(destinationChainId),
    })
  }
  return t('Swap %currencyA% to %currencyB% (%chainName%)', {
    currencyA: inToken?.symbol,
    currencyB: outToken?.symbol,
    chainName: getFullChainNameById(destinationChainId),
  })
}
