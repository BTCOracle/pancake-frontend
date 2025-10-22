import { create, windowScheduler } from '@yornaath/batshit'
import { publicClient } from 'utils/viem'
import type { MulticallParameters } from 'viem/actions'
import { keccak256, stringify } from 'viem/utils'

interface Indexed<T> {
  item: T
  index: number
}

interface BatchGroups<T, R> {
  groupBy: (items: T[]) => Record<string, T[]>
  groups: Record<string, (inputs: T[]) => Promise<R[]>>
}

export const createBatchProcessor = <T, U>(batchConfig: BatchGroups<T, U>) => {
  return async (elements: T[]) => {
    const indexMap = new Map<any, number>()
    const indexed: Indexed<T>[] = elements.map((item, index) => ({
      item,
      index,
    }))
    indexed.forEach((x) => {
      indexMap.set(x.item, x.index)
    })
    const groups = batchConfig.groupBy(elements)

    try {
      const resultsByGroup = await Promise.all(
        Object.entries(groups).map(async ([key, items]) => {
          const processor = batchConfig.groups[key]
          const results = await processor(items)
          return items.map((item, i) => {
            const index = indexMap.get(item)!
            return {
              item: results[i],
              index,
            }
          })
        }),
      )
      const list = resultsByGroup.flat() as Indexed<U>[]
      const sortedList = list.sort((a, b) => a.index - b.index)
      return sortedList.map((x) => x.item)
    } catch (error) {
      console.error(`[batch] Error processing groups`, error)
      throw error
    }
  }
}

function hashQuery(o: any): string {
  return keccak256(`0x${stringify(o)}`)
}
type MulticallQuery = { chainId: number; params: MulticallParameters<any, any> }
export const multicallBatcher = create<Record<string, unknown[]>, MulticallQuery>({
  fetcher: async (queries) => {
    // Group queries by chainId
    const grouped = queries.reduce<Record<number, Array<{ query: MulticallQuery; hash: string }>>>((acc, query) => {
      const hash = hashQuery(query)
      const currentGroup = acc[query.chainId] || []
      return {
        ...acc,
        [query.chainId]: [...currentGroup, { query, hash }],
      }
    }, {})

    // Execute multicall per chainId
    const results: Record<string, unknown[]> = {}
    await Promise.all(
      Object.entries(grouped).map(async ([chainId, calls]) => {
        const client = publicClient({ chainId: Number(chainId) })
        const batchedContracts = calls.flatMap((c) => c.query.params.contracts)

        const multicallResults = await client.multicall({
          contracts: batchedContracts,
          allowFailure: calls[0].query.params.allowFailure,
        })

        calls
          .map((c) => ({
            hash: c.hash,
            result: multicallResults.splice(0, c.query.params.contracts.length),
          }))
          .forEach((r) => {
            results[r.hash] = r.result
          })
      }),
    )

    return results
  },

  // @ts-ignore
  resolver: (items: Record<string, unknown[]>, query: MulticallQuery) => {
    // Directly return the items as the result for the query
    const hash = hashQuery(query)
    return items[hash] || []
  },

  scheduler: windowScheduler(60),
})
