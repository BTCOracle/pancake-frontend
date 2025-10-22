import { formatUnits } from "viem";

import orderBy from "lodash/orderBy";

import { DeserializedPool } from "../types";

export function sortPools<T>(account: string, sortOption: string, poolsToSort: DeserializedPool<T>[]) {
  switch (sortOption) {
    case "apr":
      // Ternary is needed to prevent pools without APR (like MIX) getting top spot
      return orderBy(poolsToSort, (pool: DeserializedPool<T>) => (pool.apr ? pool.apr : 0), "desc");
    case "earned":
      return orderBy(
        poolsToSort,
        (pool: DeserializedPool<T>) => {
          if (!pool.userData || !pool.earningTokenPrice) {
            return 0;
          }
          return pool.userData.pendingReward.times(pool.earningTokenPrice).toNumber();
        },
        "desc"
      );
    case "totalStaked": {
      return orderBy(
        poolsToSort,
        (pool: DeserializedPool<T>) => {
          let totalStaked = Number.NaN;
          if (pool.totalStaked?.isFinite() && pool.stakingTokenPrice) {
            totalStaked =
              +formatUnits(BigInt(pool.totalStaked.toString()), pool?.stakingToken?.decimals) * pool.stakingTokenPrice;
          }
          return Number.isFinite(totalStaked) ? totalStaked : 0;
        },
        "desc"
      );
    }
    case "latest":
      return orderBy(poolsToSort, (pool: DeserializedPool<T>) => Number(pool.sousId), "desc");
    default:
      return poolsToSort;
  }
}
