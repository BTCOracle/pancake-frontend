import { Cluster } from '@solana/web3.js'
import { describe, expect, it } from 'vitest'
import { getCurrentCluster } from './getCurrentCluster'

const rpcs: Record<Cluster, string> = {
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  testnet: 'https://api.testnet.solana.com',
  devnet: 'https://api.devnet.solana.com',
}

describe('getCurrentCluster', () => {
  Object.entries(rpcs).forEach(([cluster, rpc]) => {
    it(`should return ${cluster} for RPC ${rpc}`, async () => {
      const result = await getCurrentCluster(rpc)
      expect(result).toBe(cluster)
    })
  })
})
