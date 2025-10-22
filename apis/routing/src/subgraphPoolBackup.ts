import { SmartRouter } from '@pancakeswap/smart-router'
import dayjs from 'dayjs'

import { v3SubgraphProvider } from './provider'
import { getPoolsTvlFromExplorerAPI } from './queries/pools'
import { SUPPORTED_CHAINS } from './constants'
import { getPoolsObjectName, getPoolsTvlObjectName, getPoolsTvlObjectNameByDate } from './pools'

async function handleScheduled(event: ScheduledEvent) {
  switch (event.cron) {
    case '0 * * * *':
      logRejectedActions(
        await Promise.allSettled(
          SUPPORTED_CHAINS.map(async (chainId) => {
            const results = await Promise.allSettled([
              SmartRouter.getAllV3PoolsFromSubgraph({ chainId, provider: v3SubgraphProvider }),
              getPoolsTvlFromExplorerAPI({ chainId }),
            ])
            const pools = results[0].status === 'fulfilled' ? results[0].value : []
            const explorerPoolsTvls = results[1].status === 'fulfilled' ? results[1].value : []
            const address = new Set<string>()
            const poolsTvl: { address: string; tvlUSD: string }[] = []
            for (const item of explorerPoolsTvls) {
              if (Number(item.tvlUSD) > 0) {
                address.add(item.address)
                poolsTvl.push(item)
              }
            }
            for (const item of pools) {
              if (!address.has(item.address) && Number(item.tvlUSD.toString()) > 0) {
                poolsTvl.push({
                  address: item.address,
                  tvlUSD: item.tvlUSD.toString(),
                })
              }
            }

            await SUBGRAPH_POOLS.put(getPoolsTvlObjectName(chainId), JSON.stringify(poolsTvl), {
              httpMetadata: {
                contentType: 'application/json',
              },
            })
          }),
        ),
      )
      break

    case '0 0 * * *': {
      logRejectedActions(
        await Promise.allSettled(
          SUPPORTED_CHAINS.map(async (chainId) => {
            const save = async () => {
              const pools = await SmartRouter.getAllV3PoolsFromSubgraph({ chainId, provider: v3SubgraphProvider })
              const poolsTvl = pools.map((p) => ({
                address: p.address,
                tvlUSD: p.tvlUSD.toString(),
              }))
              await SUBGRAPH_POOLS.put(
                getPoolsTvlObjectNameByDate(chainId, event.scheduledTime),
                JSON.stringify(poolsTvl),
                {
                  httpMetadata: {
                    contentType: 'application/json',
                  },
                },
              )
            }
            const cleanup = () =>
              SUBGRAPH_POOLS.delete(
                getPoolsTvlObjectNameByDate(chainId, dayjs(event.scheduledTime).subtract(11, 'days').toDate()),
              )
            logRejectedActions(await Promise.allSettled([save(), cleanup()]))
          }),
        ),
      )
      break
    }
    default:
      break
  }
}

function logRejectedActions(results: PromiseSettledResult<any>[]) {
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(result.reason)
    }
  }
}

export function setupPoolBackupCrontab() {
  addEventListener('scheduled', (event) => {
    event.waitUntil(handleScheduled(event))
  })
}
