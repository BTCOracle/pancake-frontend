import { Trans } from '@pancakeswap/localization'

const MARKET_TX_MSG = (props?: Record<string, unknown>) => ({
  create: {
    title: <Trans {...props}>Create Market</Trans>,
    desc: <Trans {...props}>Create %pair% Market</Trans>,
    txHistoryTitle: <Trans {...props}>Create Market</Trans>,
    txHistoryDesc: <Trans {...props}>Create %pair% Market</Trans>
  },
  createPool: {
    title: <Trans {...props}>Create pool</Trans>,
    desc: <Trans {...props}>create %mintA% - %mintB% pool</Trans>,
    txHistoryTitle: <Trans {...props}>Create pool</Trans>,
    txHistoryDesc: <Trans {...props}>create %mintA% - %mintB% pool</Trans>
  }
})

export const getTxMeta = ({ action, values }: { action: keyof ReturnType<typeof MARKET_TX_MSG>; values: Record<string, unknown> }) => {
  const meta = MARKET_TX_MSG(values)[action]
  return {
    title: meta.title,
    description: meta.desc,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
