import { IndexerApiClient } from '../client'
import { paths } from '../schema'

export type Pool = paths['/cached/v1/pools/']['get']['responses']['200']['content']['application/json']['data'][0]

// @todo @ChefJerry add pagination support
export const getPools = async (): Promise<
  | {
      data: Pool[]
      pagination: {
        /** @default 1 */
        page: string | number
        /** @default 20 */
        limit: string | number
        /** @default 0 */
        total: string | number
        /** @default 1 */
        totalPages: string | number
      }
    }
  | undefined
> => {
  const resp = await IndexerApiClient.GET('/cached/v1/pools/')

  return resp.data
}
