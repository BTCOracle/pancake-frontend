export interface operations {
  verifyContract: {
    parameters: {
      query?: {
        address: Address
        network: 'bsc' | 'bsc-testnet' | 'ethereum'
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            isUpgradable: boolean
            isVerified: boolean
          }
        }
      }
    }
  }
  getCampaignsByPoolId: {
    parameters: {
      query?: {
        poolIds: Address[]
        limit?: number
        page?: number
      }
      header?: never
      path: {
        chainId: number
        includeInactive: boolean
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            limit: number
            page: number
            totalRecords: number
            campaigns?: {
              epochEndTimestamp: number
              campaignId: `${number}`
              campaignType: `${number}`
              duration: `${number}`
              poolId: Address
              poolManager: Address
              rewardToken: Address
              startTime: Record<string, never> | string
              status: number
              totalRewardAmount: string
            }[]
          }
        }
      }
    }
  }
  getCampaignsByChainId: {
    parameters: {
      query?: {
        limit?: number
        page?: number
      }
      header?: never
      path: {
        chainId: number
        includeInactive: boolean
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            limit: number
            page: number
            totalRecords: number
            campaigns?: {
              epochEndTimestamp: number
              campaignId: `${number}`
              campaignType: `${number}`
              duration: `${number}`
              poolId: Address
              poolManager: Address
              rewardToken: Address
              startTime: Record<string, never> | string
              status: number
              totalRewardAmount: string
            }[]
          }
        }
      }
    }
  }
  getUserFarmRewardsByChainId: {
    parameters: {
      query?: never
      header?: never
      path: {
        chainId: number
        address: string
        timestamp?: Record<string, never> | string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Successfully batch get unclaimed fees */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            rewards: {
              endBlock: number
              epochEndTimestamp: Record<string, never> | string
              user: string
              rewardTokenAddress: Address
              totalRewardAmount: string
              merkleRoot: Address
              proofs: Address[]
            }[]
          }
        }
      }
    }
  }
  getPoolFarmRewards: {
    parameters: {
      query?: never
      header?: never
      path: {
        chainId: number
        address: string
        poolId?: string
        timestamp?: Record<string, never> | string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Successfully batch get unclaimed fees */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            rewardsInfo: {
              poolId: string
              endBlock: number
              epochEndTimestamp: Record<string, never> | string
              user: string
              campaignId: string
              rewardTokenAddress: Address
              tokenIds: [string, string]
              rewardAmounts: [string, string]
              merkleRoot: string
            }[]
          }
        }
      }
    }
  }
  getMerkleRootByTimestamp: {
    parameters: {
      query?: never
      header?: never
      path: {
        chainId: number
        timestamp?: Record<string, never> | string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': {
            endBlock: number
            epochEndTimestamp: Record<string, never> | string
            merkleRoot: string
          }
        }
      }
    }
  }
}
interface paths {
  '/farms/verification/verify-contract': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['verifyContract']
    put?: never
    post: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/farms/campaigns/{chainId}/{includeInactive}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['getCampaignsByChainId']
    put?: never
    post: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/farms/campaigns/{chainId}/{includeInactive}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['getCampaignsByPoolId']
    put?: never
    post: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/farms/users/{chainId}/{address}/{timestamp}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['getUserFarmRewardsByChainId']
    put?: never
    post: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/farms/user-rewards/{chainId}/{address}/{poolId}/{timestamp}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['getPoolFarmRewards']
    put?: never
    post: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }

  '/farms/user-rewards/{chainId}/{address}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['getPoolFarmRewards']
    put?: never
    post: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }

  '/farms/root/{chainId}/{timestamp}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['getMerkleRootByTimestamp']
    put?: never
    post: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }

  '/farms/epoch-root/{chainId}/{timestamp}': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['getMerkleRootByTimestamp']
    put?: never
    post: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}
