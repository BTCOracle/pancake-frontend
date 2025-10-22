import { paths } from '../schema'

export type PoolInfo =
  | paths['/cached/v1/pools/info/mint']['get']['responses']['200']['content']['application/json']['data'][0]
  | paths['/cached/v1/pools/info/ids']['get']['responses']['200']['content']['application/json']['data'][0]
