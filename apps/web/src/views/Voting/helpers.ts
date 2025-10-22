import { bscTokens } from '@pancakeswap/tokens'
import groupBy from 'lodash/groupBy'
import { Proposal, ProposalState, ProposalType, Vote } from 'state/types'
import { Address, createPublicClient, http } from 'viem'
import { bsc } from 'viem/chains'
import { ADMINS, PANCAKE_SPACE } from './config'
import { getScores } from './getScores'

export const isCoreProposal = (proposal: Proposal) => {
  return ADMINS.includes(proposal.author.toLowerCase())
}

export const filterProposalsByType = (proposals: Proposal[], proposalType: ProposalType) => {
  if (proposals) {
    switch (proposalType) {
      case ProposalType.COMMUNITY:
        return proposals.filter((proposal) => !isCoreProposal(proposal))
      case ProposalType.CORE:
        return proposals.filter((proposal) => isCoreProposal(proposal))
      case ProposalType.ALL:
      default:
        return proposals
    }
  } else {
    return []
  }
}

export const filterProposalsByState = (proposals: Proposal[], state: ProposalState) => {
  return proposals.filter((proposal) => proposal.state === state)
}

const STRATEGIES = [
  {
    name: 'erc20-balance-of',
    params: { symbol: bscTokens.cake.symbol, address: bscTokens.cake.address, decimals: bscTokens.cake.decimals },
  },
]
const NETWORK = '56'

export const VOTING_POWER_BLOCK = {
  v0: 16300686n,
  v1: 17137653n,
}

export const VECAKE_VOTING_POWER_BLOCK = 34371669n

/**
 *  Get voting power by single user for each category
 */
type GetVotingPowerType = {
  total: number
  voter: string
  poolsBalance?: number
  cakeBalance?: number
  cakePoolBalance?: number
  cakeBnbLpBalance?: number
  cakeVaultBalance?: number
  ifoPoolBalance?: number
  lockedCakeBalance?: number
  lockedEndTime?: number
}

// Voting power for CAKE holders
type GetCakeVotingPowerType = {
  total: number
  voter: string
  cakeBalance: number
}

const nodeRealProvider = createPublicClient({
  transport: http(`https://bsc-mainnet.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODE_REAL_API_ETH}`),
  chain: bsc,
})

export const getCakeVotingPower = async (account: Address, blockNumber?: bigint): Promise<GetCakeVotingPowerType> => {
  // Use erc20-balance-of strategy to get CAKE balance as voting power
  const scores = await getScores(PANCAKE_SPACE, STRATEGIES, NETWORK, [account], Number(blockNumber))
  const result = scores[0][account] || 0

  return {
    total: result,
    voter: account,
    cakeBalance: result,
  }
}

export const getVotingPower = async (
  account: Address,
  poolAddresses: Address[],
  blockNumber?: bigint,
): Promise<GetVotingPowerType> => {
  // Simplified logic, directly using erc20-balance-of strategy to get CAKE balance as voting power
  const scores = await getScores(PANCAKE_SPACE, STRATEGIES, NETWORK, [account], Number(blockNumber))
  const cakeBalance = scores[0][account] || 0

  return {
    voter: account,
    total: cakeBalance,
    cakeBalance,
    // default 0, we only care about cake value
    poolsBalance: 0,
    cakePoolBalance: 0,
    cakeBnbLpBalance: 0,
    cakeVaultBalance: 0,
    lockedCakeBalance: 0,
    lockedEndTime: 0,
  }
}

export const calculateVoteResults = (votes: Vote[]): { [key: string]: Vote[] } => {
  if (votes) {
    const result = groupBy(votes, (vote) => vote.proposal.choices[vote.choice - 1])
    return result
  }
  return {}
}

export const getTotalFromVotes = (votes: Vote[]) => {
  if (votes) {
    return votes.reduce((accum, vote) => {
      let power = parseFloat(vote.metadata?.votingPower || '0')

      if (!power) {
        power = 0
      }

      return accum + power
    }, 0)
  }
  return 0
}
