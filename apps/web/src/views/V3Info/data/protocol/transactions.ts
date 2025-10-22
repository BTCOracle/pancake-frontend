import { explorerApiClient } from 'state/info/api/client'
import type { components } from 'state/info/api/schema'
import { Transaction } from 'state/info/types'
import { transformTransaction } from 'views/V3Info/utils'

export async function fetchTopTransactions(
  chainName: components['schemas']['ChainName'],
  signal: AbortSignal,
): Promise<Transaction[] | undefined> {
  try {
    const data = await explorerApiClient
      .GET('/cached/tx/v3/{chainName}/recent', {
        signal,
        params: {
          path: {
            chainName,
          },
        },
      })
      .then((res) => res.data)

    if (!data) {
      return undefined
    }

    return data.map(transformTransaction)
  } catch {
    return undefined
  }
}
