import { Trans } from '@pancakeswap/localization'

const LIQUIDITY_TX_MSG = (props?: Record<string, unknown>) => ({
  addLiquidity: {
    title: <Trans {...props}>Add Liquidity</Trans>,
    desc: <Trans {...props}>Added %amountA% %symbolA% and %amountB% %symbolB%.</Trans>,
    txHistoryTitle: <Trans {...props}>Add Liquidity</Trans>,
    txHistoryDesc: <Trans {...props}>Added %amountA% %symbolA% and %amountB% %symbolB%.</Trans>
  },
  removeLiquidity: {
    title: <Trans {...props}>Remove Liquidity</Trans>,
    desc: <Trans {...props}>Removed %amountA% %symbolA% and %amountB% %symbolB%.</Trans>,
    txHistoryTitle: <Trans {...props}>Remove Liquidity</Trans>,
    txHistoryDesc: <Trans {...props}>Removed %amountA% %symbolA% and %amountB% %symbolB%.</Trans>
  },
  createPool: {
    title: <Trans {...props}>Create pool</Trans>,
    desc: <Trans {...props}>create %mintA% - %mintB% pool</Trans>,
    txHistoryTitle: '',
    txHistoryDesc: ''
  },
  removeLpBeforeMigrate: {
    title: <Trans {...props}>Remove Liquidity</Trans>,
    desc: <Trans {...props}>Remove Liquidity</Trans>,
    txHistoryTitle: '',
    txHistoryDesc: ''
  },
  migrateToClmm: {
    title: <Trans {...props}>Migrate to CLMM</Trans>,
    desc: <Trans {...props}>Migrate %mint% to CLMM position.</Trans>,
    txHistoryTitle: '',
    txHistoryDesc: ''
  },
  lockLp: {
    title: <Trans {...props}>Lock Position</Trans>,
    desc: <Trans {...props}>Position %position% locked</Trans>,
    txHistoryTitle: <Trans {...props}>Lock Position</Trans>,
    txHistoryDesc: <Trans {...props}>Position %position% locked</Trans>
  },
  harvestLock: {
    title: <Trans {...props}>Harvested Rewards</Trans>,
    desc: <Trans {...props}>Harvest Locked Position Rewards</Trans>,
    txHistoryTitle: <Trans {...props}>Harvested Rewards</Trans>,
    txHistoryDesc: <Trans {...props}>Harvest Locked Position Rewards</Trans>
  }
})
export const getTxMeta = ({
  action,
  values = {}
}: {
  action: keyof ReturnType<typeof LIQUIDITY_TX_MSG>
  values?: Record<string, unknown>
}) => {
  const meta = LIQUIDITY_TX_MSG(values)[action]
  return {
    title: meta.title,
    description: meta.desc,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
