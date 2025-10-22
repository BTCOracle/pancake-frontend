import { OrderType } from '@pancakeswap/price-api-sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { CurrencyAmount, Currency, TradeType, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { atomFamily } from 'jotai/utils'
import { BridgeTradeError } from 'quoter/quoter.types'
import { getUnifiedTokenAddress, postSolanaEVMBridgeMetadata } from 'views/Swap/Bridge/api'
import { BridgeMetadataParams } from 'views/Swap/Bridge/types'
import { InterfaceOrder } from 'views/Swap/utils'
import { ChainId, isSolana } from '@pancakeswap/chains'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import { solanaTokens, USDC } from '@pancakeswap/tokens'
import { solanaUserSlippageAtomWithLocalStorage, userSlippageAtomWithLocalStorage } from '@pancakeswap/utils/user'
import { isValidSolanaAddress } from 'utils/isValidSolanaAddress'
import { calculateBridgeFeeAmount } from 'quoter/utils/crosschain-utils/utils/calculateBridgeFeeAmount'
import { atomWithLoadable } from './atomWithLoadable'

export const solanaBridgeQuoteAtom = atomFamily(
  (params: BridgeMetadataParams) =>
    atomWithLoadable(async (get) => {
      const { inputAmount, outputCurrency, recipientOnDestChain } = params
      const slippageToleranceEVM = get(userSlippageAtomWithLocalStorage)
      const slippageToleranceSolana = get(solanaUserSlippageAtomWithLocalStorage)
      const { account, solanaAccount } = get(accountActiveChainAtom)

      if (recipientOnDestChain && isSolana(outputCurrency.chainId) && !isValidSolanaAddress(recipientOnDestChain)) {
        throw new BridgeTradeError('Invalid recipient')
      }

      const recipientAddress = recipientOnDestChain || (isSolana(outputCurrency.chainId) ? solanaAccount : account)

      const metadata = await postSolanaEVMBridgeMetadata({
        inputToken: getUnifiedTokenAddress(inputAmount.currency),
        originChainId: inputAmount.currency.chainId,
        outputToken: getUnifiedTokenAddress(outputCurrency),
        destinationChainId: outputCurrency.chainId,
        amount: inputAmount.quotient.toString(),
        user: isSolana(inputAmount.currency.chainId) ? solanaAccount : account,
        recipientOnDestChain: recipientAddress,
        slippageTolerance: isSolana(inputAmount.currency.chainId)
          ? slippageToleranceSolana.toString()
          : slippageToleranceEVM.toString(),
      })

      if (!metadata.supported) {
        throw new BridgeTradeError(metadata?.reason || metadata?.error?.message || 'Unknown error')
      }

      const outputAmount = UnifiedCurrencyAmount.fromRawAmount(
        outputCurrency,
        metadata.bridgeTransactionData.outputAmount,
      ) as CurrencyAmount<Currency>

      const stableCoin = isSolana(inputAmount.currency.chainId)
        ? solanaTokens.usdc
        : USDC[inputAmount.currency.chainId as ChainId]

      const bridgeFee = CurrencyAmount.fromRawAmount(
        stableCoin,
        calculateBridgeFeeAmount(metadata.bridgeTransactionData.totalRelayFee, stableCoin.decimals),
      )

      const bridgeQuote: InterfaceOrder = {
        bridgeTransactionData: metadata.bridgeTransactionData,
        bridgeFee,
        expectedFillTimeSec: metadata.expectedFillTimeSec ? Number.parseInt(metadata.expectedFillTimeSec) : 0,
        type: OrderType.PCS_BRIDGE,
        trade: {
          inputAmount,
          outputAmount,
          routes: [
            {
              path: [inputAmount.currency, outputAmount.currency],
              inputAmount,
              outputAmount,
              type: RouteType.BRIDGE,
            },
          ],
          tradeType: TradeType.EXACT_INPUT,
        },
      }

      return bridgeQuote
    }),
  // add Equality check for BridgeMetadataParams
  (a, b) =>
    a.inputAmount.quotient.toString() === b.inputAmount.quotient.toString() &&
    a.outputCurrency.wrapped.address === b.outputCurrency.wrapped.address &&
    a.outputCurrency.symbol === b.outputCurrency.symbol &&
    a.inputAmount.currency.symbol === b.inputAmount.currency.symbol &&
    a.inputAmount.currency.chainId === b.inputAmount.currency.chainId &&
    a.outputCurrency.chainId === b.outputCurrency.chainId &&
    a.nonce === b.nonce &&
    a.recipientOnDestChain === b.recipientOnDestChain,
)
