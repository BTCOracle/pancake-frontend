import { datadogLogs, LogsInitConfiguration } from '@datadog/browser-logs'
import { GTMAction, GTMCategory, GTMEvent } from './curstomGTMEventTracking'

try {
  datadogLogs.init({
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || '',
    env: process.env.NEXT_PUBLIC_VERCEL_ENV,
    version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    site: process.env.NEXT_PUBLIC_DD_RUM_SITE || '',
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
    service: 'pancakeswap-web'
  })
} catch (e) {
  console.error(e)
}

export function getLogger(name: string, config?: Partial<LogsInitConfiguration>) {
  const logger = datadogLogs.getLogger(name)
  if (logger) {
    return logger
  }
  return datadogLogs.createLogger(name, {
    handler: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'http' : ['console', 'http'],
    context: {
      service: `pancakeswap-web-${name}`,
      ...config
    }
  })
}

export const logger = getLogger('solana')

interface SwapTXSuccessEventParams {
  txId: string
  chain?: string
  from?: string
  to?: string
}

export const logDDSwapTXSuccessEvent = ({ txId, chain, from, to = '' }: SwapTXSuccessEventParams) => {
  logger.info(GTMEvent.SwapTXSuccess, {
    event: GTMEvent.SwapTXSuccess,
    action: GTMAction.SwapTransactionSent,
    product_name: GTMCategory.Swap,
    tx_id: txId,
    chain,
    from_address: from,
    to_address: to
  })
}

export const logDDWalletConnectedEvent = (name: string) => {
  logger.info(GTMEvent.WalletConnected, {
    event: GTMEvent.WalletConnected,
    action: GTMAction.WalletConnected,
    name: GTMCategory.Wallet,
    label: name
  })
}

export const logDDNetworkErrorEvent = ({ url, errorMsg }: { url: string; errorMsg: string }) => {
  logger.info(GTMEvent.SolErrorLog, {
    event: GTMEvent.SolErrorLog,
    url,
    errorMsg
  })
}
