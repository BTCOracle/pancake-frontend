import { IndexerApiClient } from '../client'
import { paths } from '../schema'

export const getPoolsByMints = async ({
  mintA,
  mintB,
  poolType,
  pageSize,
  page,
}: {
  mintA: string | undefined
  mintB: string | undefined
  poolType?: string
  poolSortField?: string
  sortType?: string
  pageSize?: string | number
  page?: string | number
}): Promise<
  paths['/cached/v1/pools/info/mint']['get']['responses']['200']['content']['application/json']['data'] | undefined
> => {
  const [token0, token1] = mintA && mintB ? (mintA < mintB ? [mintA, mintB] : [mintB, mintA]) : [mintA, mintB]

  const query = {
    poolType,
    pageSize,
    page,
  }
  const resp = await IndexerApiClient.GET('/cached/v1/pools/info/mint', {
    params: {
      query:
        token0 && token1
          ? {
              token0,
              token1,
              ...query,
            }
          : token0
          ? {
              token0,
              ...query,
            }
          : {
              token1,
              ...query,
            },
    },
  })

  return resp.data?.data
}
