import { ApiV3PoolInfoConcentratedItem, ClmmKeys, getPdaPoolRewardVaulId } from '@pancakeswap/solana-core-sdk'
import { PublicKey } from '@solana/web3.js'

export function getClmmKeysFromPoolInfo(poolInfo: ApiV3PoolInfoConcentratedItem): ClmmKeys {
  return {
    programId: poolInfo.programId,
    id: poolInfo.id,
    config: poolInfo.config,
    mintA: poolInfo.mintA,
    mintB: poolInfo.mintB,
    // lookupTableAccount: poolInfo.lookupTableAccount
    // alt: poolInfo.alt
    openTime: poolInfo.openTime,
    vault: (poolInfo as any).vault,
    rewardInfos: poolInfo.rewardDefaultInfos.map((r) => ({
      mint: r.mint,
      vault: getPdaPoolRewardVaulId(
        new PublicKey(poolInfo.programId),
        new PublicKey(poolInfo.id),
        new PublicKey(r.mint.address)
      ).publicKey.toBase58()
    })),
    observationId: '',
    exBitmapAccount: ''
  }
}
