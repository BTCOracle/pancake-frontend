import { Cluster, Connection } from '@solana/web3.js'
import { CLUSTER_GENESIS_HASHES } from '../constants/cluster'

/**
 * Get the current Solana cluster based on the RPC endpoint.
 * @param rpcEndpoint The RPC endpoint URL.
 * @returns The current cluster or undefined if not found. Not supported on localnet.
 */
export const getCurrentCluster = async (rpcEndpoint: string): Promise<Cluster | undefined> => {
  try {
    const connection = new Connection(rpcEndpoint)
    const genesisHash = await connection.getGenesisHash()
    let cluster: Cluster | undefined

    for (const key of Object.keys(CLUSTER_GENESIS_HASHES) as (keyof typeof CLUSTER_GENESIS_HASHES)[]) {
      if (CLUSTER_GENESIS_HASHES[key] === genesisHash) {
        cluster = key
        break
      }
    }

    return cluster
  } catch (error) {
    console.error('Error getting current cluster:', error)
    return undefined
  }
}
