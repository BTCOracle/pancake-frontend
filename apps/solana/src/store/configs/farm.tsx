import { Trans } from '@pancakeswap/localization'

export const MIN_DURATION_DAYS = 1
export const MAX_DURATION_DAYS = 90

const FARM_TX_MSG = (props?: Record<string, unknown>) => ({
  deposit: {
    title: <Trans {...props}>Staked %symbol%</Trans>,
    desc: <Trans {...props}>You staked %amount% %symbol%</Trans>,
    txHistoryTitle: <Trans {...props}>Liquidity Staked</Trans>,
    txHistoryDesc: <Trans {...props}>Staked %amount% %symbol%</Trans>
  },
  withdraw: {
    title: <Trans {...props}>Unstaked %symbol%</Trans>,
    desc: <Trans {...props}>You Unstaked %amount% %symbol%</Trans>,
    txHistoryTitle: <Trans {...props}>Unstaked %symbol%</Trans>,
    txHistoryDesc: <Trans {...props}>You Unstaked %amount% %symbol%</Trans>
  },
  claimIdo: {
    title: <Trans {...props}>AccelerRaytor Claim</Trans>,
    desc: <Trans {...props}>Claim %amountA% %symbolA%</Trans>,
    txHistoryTitle: <Trans {...props}>AccelerRaytor Claim</Trans>,
    txHistoryDesc: <Trans {...props}>Claim %amountA% %symbolA%</Trans>
  },
  claimIdo1: {
    title: <Trans {...props}>AccelerRaytor Claim</Trans>,
    desc: <Trans {...props}>Claim %amountA% %symbolA% and %amountB% %symbolB%</Trans>,
    txHistoryTitle: <Trans {...props}>AccelerRaytor Claim</Trans>,
    txHistoryDesc: <Trans {...props}>Claim %amountA% %symbolA% and %amountB% %symbolB%</Trans>
  },
  harvest: {
    title: <Trans {...props}>Harvested Rewards</Trans>,
    desc: <Trans {...props}>Harvest Farm Rewards</Trans>,
    txHistoryTitle: <Trans {...props}>Harvest Rewards</Trans>,
    txHistoryDesc: <Trans {...props}>Harvest Farm Rewards</Trans>
  },
  updateRewards: {
    title: <Trans {...props}>Update rewards</Trans>,
    desc: <Trans {...props}>Update rewards in %pool%</Trans>,
    txHistoryTitle: <Trans {...props}>Update rewards</Trans>,
    txHistoryDesc: <Trans {...props}>Update rewards in %pool%</Trans>
  }
})

export const getTxMeta = ({ action, values }: { action: keyof ReturnType<typeof FARM_TX_MSG>; values: Record<string, unknown> }) => {
  const meta = FARM_TX_MSG(values)[action]
  return {
    title: meta.title,
    description: meta.desc,
    txHistoryTitle: meta.txHistoryTitle || meta.title,
    txHistoryDesc: meta.txHistoryDesc || meta.desc,
    txValues: values
  }
}
