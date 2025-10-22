import { useTranslation } from '@pancakeswap/localization'
import { BridgeTradeError } from 'quoter/quoter.types'
import { useMemo, useCallback } from 'react'

// Relay API Error Codes - Based on https://docs.relay.link/references/api/api_core_concepts/handling-errors
export enum RELAY_ERROR {
  // Expected Errors - User/Input Related
  AMOUNT_TOO_LOW = 'AMOUNT_TOO_LOW',
  CHAIN_DISABLED = 'CHAIN_DISABLED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_INPUT_CURRENCY = 'INVALID_INPUT_CURRENCY',
  INVALID_OUTPUT_CURRENCY = 'INVALID_OUTPUT_CURRENCY',
  INVALID_SLIPPAGE_TOLERANCE = 'INVALID_SLIPPAGE_TOLERANCE',
  NO_QUOTES = 'NO_QUOTES',
  NO_SWAP_ROUTES_FOUND = 'NO_SWAP_ROUTES_FOUND',
  NO_INTERNAL_SWAP_ROUTES_FOUND = 'NO_INTERNAL_SWAP_ROUTES_FOUND',
  ROUTE_TEMPORARILY_RESTRICTED = 'ROUTE_TEMPORARILY_RESTRICTED',
  SANCTIONED_CURRENCY = 'SANCTIONED_CURRENCY',
  SANCTIONED_WALLET_ADDRESS = 'SANCTIONED_WALLET_ADDRESS',
  SWAP_IMPACT_TOO_HIGH = 'SWAP_IMPACT_TOO_HIGH',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  UNSUPPORTED_CURRENCY = 'UNSUPPORTED_CURRENCY',
  UNSUPPORTED_ROUTE = 'UNSUPPORTED_ROUTE',
  USER_RECIPIENT_MISMATCH = 'USER_RECIPIENT_MISMATCH',

  // Permission/Access Related
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Advanced Features (less common)
  EXTRA_TXS_NOT_SUPPORTED = 'EXTRA_TXS_NOT_SUPPORTED',
  INVALID_EXTRA_TXS = 'INVALID_EXTRA_TXS',
  INVALID_GAS_LIMIT_FOR_DEPOSIT_SPECIFIED_TXS = 'INVALID_GAS_LIMIT_FOR_DEPOSIT_SPECIFIED_TXS',
  UNSUPPORTED_EXECUTION_TYPE = 'UNSUPPORTED_EXECUTION_TYPE',

  // Unexpected Errors - Infrastructure Related
  DESTINATION_TX_FAILED = 'DESTINATION_TX_FAILED',
  ERC20_ROUTER_ADDRESS_NOT_FOUND = 'ERC20_ROUTER_ADDRESS_NOT_FOUND',
  PERMIT_FAILED = 'PERMIT_FAILED',
  SWAP_QUOTE_FAILED = 'SWAP_QUOTE_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum CrossChainAPIErrorCode {
  // 4000 - 4010
  NOT_FOUND = 'CCA-4000',
  INVALID_INPUT = 'CCA-4001',
  MISSING_MANDATORY_FIELDS = 'CCA-4004',
  INVALID_COMMAND = 'CCA-4005',
  INVALID_TOKEN_INFO = 'CCA-4006',
  RECORD_NOT_FOUND = 'CCA-4008',
  TRANSACTION_NOT_FOUND_OR_REVERTED = 'CCA-4009',
  INVALID_CHAIN_NAME = 'CCA-4010',

  // 5000 - 5013
  SERVER_ERROR = 'CCA-5000',
  CHAIN_NOT_FOUND = 'CCA-5005',
  EMPTY_CACHE = 'CCA-5010',
  DOWNSTREAM_SERVER_ERROR = 'CCA-5011',
  POST_BRIDGE_COMMAND_FAILED = 'CCA-5012',
  PERMIT2_NOT_FOUND = 'CCA-5013',
}

// Helper function to create error message mappings with fallbacks
export const useBridgeErrorMessages = () => {
  const { t } = useTranslation()

  return useMemo(() => {
    // Common error message patterns for maintainability
    const messages = {
      tryAgain: t('Unexpected error. Please try again!'),
      transactionNotFound: t('Requested transaction details not found.'),
      unsupportedChain: t('Selected chain is down. Please try again later.'),
      destinationFailed: t('Transaction failed on destination chain.'),
      tokenNotSupported: t("This token isn't supported."),
      insufficientAmount: t('Retry with higher input amount!'),
      insufficientBalance: t('Insufficient balance.'),
      noRoutes: t('No route available for this pair.'),
      invalidAddress: t('Invalid address. Please check and try again.'),
      slippageTooHigh: t('Price impact is too high. Please adjust your slippage settings.'),
      accessDenied: t('Access denied. Please check your permissions.'),
      sanctioned: t('This transaction is not permitted due to compliance restrictions.'),
      temporaryIssue: t('Service temporarily unavailable. Please try again later.'),
      insufficientLiquidity: t('Retry with lower input amount!'),
    }

    return {
      // Relay API Error Messages
      [RELAY_ERROR.AMOUNT_TOO_LOW]: messages.insufficientAmount,
      [RELAY_ERROR.CHAIN_DISABLED]: messages.unsupportedChain,
      [RELAY_ERROR.INSUFFICIENT_FUNDS]: messages.insufficientBalance,
      [RELAY_ERROR.INSUFFICIENT_LIQUIDITY]: messages.insufficientLiquidity,
      [RELAY_ERROR.INVALID_ADDRESS]: messages.invalidAddress,
      [RELAY_ERROR.INVALID_INPUT_CURRENCY]: messages.tokenNotSupported,
      [RELAY_ERROR.INVALID_OUTPUT_CURRENCY]: messages.tokenNotSupported,
      [RELAY_ERROR.INVALID_SLIPPAGE_TOLERANCE]: t('Invalid slippage tolerance. Please adjust your settings.'),
      [RELAY_ERROR.NO_QUOTES]: messages.noRoutes,
      [RELAY_ERROR.NO_SWAP_ROUTES_FOUND]: messages.noRoutes,
      [RELAY_ERROR.NO_INTERNAL_SWAP_ROUTES_FOUND]: messages.noRoutes,
      [RELAY_ERROR.ROUTE_TEMPORARILY_RESTRICTED]: messages.temporaryIssue,
      [RELAY_ERROR.SANCTIONED_CURRENCY]: messages.sanctioned,
      [RELAY_ERROR.SANCTIONED_WALLET_ADDRESS]: messages.sanctioned,
      [RELAY_ERROR.SWAP_IMPACT_TOO_HIGH]: messages.slippageTooHigh,
      [RELAY_ERROR.UNSUPPORTED_CHAIN]: messages.unsupportedChain,
      [RELAY_ERROR.UNSUPPORTED_CURRENCY]: messages.tokenNotSupported,
      [RELAY_ERROR.UNSUPPORTED_ROUTE]: messages.noRoutes,
      [RELAY_ERROR.USER_RECIPIENT_MISMATCH]: t('User and recipient addresses must match for this swap type.'),
      [RELAY_ERROR.FORBIDDEN]: messages.accessDenied,
      [RELAY_ERROR.UNAUTHORIZED]: messages.accessDenied,
      [RELAY_ERROR.EXTRA_TXS_NOT_SUPPORTED]: t('Additional transactions are not supported for this swap type.'),
      [RELAY_ERROR.INVALID_EXTRA_TXS]: t('Invalid additional transaction configuration.'),
      [RELAY_ERROR.INVALID_GAS_LIMIT_FOR_DEPOSIT_SPECIFIED_TXS]: t('Invalid gas limit configuration.'),
      [RELAY_ERROR.UNSUPPORTED_EXECUTION_TYPE]: t('This execution type is not supported.'),
      [RELAY_ERROR.DESTINATION_TX_FAILED]: messages.destinationFailed,
      [RELAY_ERROR.ERC20_ROUTER_ADDRESS_NOT_FOUND]: messages.tryAgain,
      [RELAY_ERROR.PERMIT_FAILED]: t('Token approval failed. Please try again.'),
      [RELAY_ERROR.SWAP_QUOTE_FAILED]: messages.tryAgain,
      [RELAY_ERROR.UNKNOWN_ERROR]: messages.tryAgain,

      // Cross-Chain API Error Messages (simplified with common patterns)
      [CrossChainAPIErrorCode.INVALID_INPUT]: messages.tryAgain,
      [CrossChainAPIErrorCode.NOT_FOUND]: messages.tryAgain,
      [CrossChainAPIErrorCode.SERVER_ERROR]: messages.tryAgain,
      [CrossChainAPIErrorCode.RECORD_NOT_FOUND]: messages.transactionNotFound,
      [CrossChainAPIErrorCode.TRANSACTION_NOT_FOUND_OR_REVERTED]: messages.transactionNotFound,
      [CrossChainAPIErrorCode.INVALID_CHAIN_NAME]: messages.unsupportedChain,
      [CrossChainAPIErrorCode.CHAIN_NOT_FOUND]: messages.unsupportedChain,
      [CrossChainAPIErrorCode.MISSING_MANDATORY_FIELDS]: messages.tryAgain,
      [CrossChainAPIErrorCode.INVALID_COMMAND]: messages.tryAgain,
      [CrossChainAPIErrorCode.INVALID_TOKEN_INFO]: t("Couldn't retrieve token info. Please try again!"),
      [CrossChainAPIErrorCode.EMPTY_CACHE]: messages.tryAgain,
      [CrossChainAPIErrorCode.DOWNSTREAM_SERVER_ERROR]: messages.tryAgain,
      [CrossChainAPIErrorCode.POST_BRIDGE_COMMAND_FAILED]: messages.destinationFailed,
      [CrossChainAPIErrorCode.PERMIT2_NOT_FOUND]: messages.tryAgain,
    }
  }, [t])
}

// Hook for getting user-friendly error messages from any error
export const useBridgeTradeErrorHandler = () => {
  const errorMessages = useBridgeErrorMessages()

  return useCallback(
    (error: BridgeTradeError): string | null => {
      if (!error) return null

      // not BridgeTradeError return null
      if (!(error instanceof BridgeTradeError)) {
        return null
      }

      // Handle BridgeTradeError
      const { message } = error

      // Check for specific error patterns first (legacy compatibility)
      if (message.includes("doesn't have enough funds to support this deposit")) {
        return errorMessages[RELAY_ERROR.INSUFFICIENT_LIQUIDITY]
      }

      if (message.includes('too low relative to fees')) {
        return errorMessages[RELAY_ERROR.AMOUNT_TOO_LOW]
      }

      return errorMessages[message] || message
    },
    [errorMessages],
  )
}
