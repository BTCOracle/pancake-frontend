import { useTranslation } from '@pancakeswap/localization'
import { UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/sdk'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'

import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { isAddressEqual, safeGetAddress, safeGetUnifiedAddress } from 'utils'

import { ClassicOrder, PriceOrder } from '@pancakeswap/price-api-sdk'
import { isClassicOrder } from 'views/Swap/utils'
import useAccountActiveChain from 'hooks/useAccountActiveChain'

interface Balances {
  [Field.INPUT]?: UnifiedCurrencyAmount<UnifiedCurrency>
  [Field.OUTPUT]?: UnifiedCurrencyAmount<UnifiedCurrency>
}

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: ClassicOrder['trade'], checksummedAddress: string): boolean {
  // TODO check for pools
  return trade.routes.some((r) =>
    r.path.some((token) => token.isToken && isAddressEqual(token.address, checksummedAddress)),
  )
}

// TODO: update
const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // v2 router 02
]

export function useSwapInputError(
  order: PriceOrder | undefined,
  currencyBalances: Balances,
  pairCurrencies: (UnifiedCurrency | undefined)[],
): string | undefined {
  const { t } = useTranslation()
  const { unifiedAccount, chainId } = useAccountActiveChain()
  const { independentField, typedValue } = useSwapState()

  // Use pairCurrencies instead of currencyBalances
  // to avoid UI show "Select a token" although user already selected a token but currencyBalances throw error
  // balance error issue: can be rpc or chain down.
  const [inputCurrency, outputCurrency] = pairCurrencies

  const to: string | null = unifiedAccount || null

  const isExactIn: boolean = independentField === Field.INPUT
  const independentCurrency = isExactIn ? inputCurrency : outputCurrency

  const parsedAmount = tryParseAmount(typedValue, independentCurrency ?? undefined)

  let inputError: string | undefined
  if (!unifiedAccount) {
    inputError = t('Connect Wallet')
  }

  if (!parsedAmount) {
    inputError = inputError ?? t('Enter an amount')
  }

  if (!inputCurrency || !outputCurrency) {
    inputError = inputError ?? t('Select a token')
  }

  const formattedTo = safeGetUnifiedAddress(chainId, to)
  if (!to || !formattedTo) {
    inputError = inputError ?? t('Enter a recipient')
  } else if (
    BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
    (isClassicOrder(order) && order.trade && involvesAddress(order.trade, formattedTo))
  ) {
    inputError = inputError ?? t('Invalid recipient')
  }

  // compare input balance to max input based on version
  // use the actual input amount instead of the slippage adjusted amount
  const balanceIn = currencyBalances[Field.INPUT]
  const actualInputAmount = order?.trade?.inputAmount

  if (balanceIn && actualInputAmount && balanceIn.lessThan(actualInputAmount)) {
    inputError = t('Insufficient %symbol% balance', { symbol: actualInputAmount.currency.symbol })
  }

  return inputError || ''
}
