export const revenueSharingPoolGatewayABI = [
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_revenueSharingPools',
        type: 'address[]',
      },
      { internalType: 'address', name: '_for', type: 'address' },
    ],
    name: 'claimMultiple',
    outputs: [{ internalType: 'uint256', name: 'totalRewardAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_revenueSharingPools',
        type: 'address[]',
      },
      { internalType: 'address', name: '_for', type: 'address' },
    ],
    name: 'claimMultipleWithoutProxy',
    outputs: [{ internalType: 'uint256', name: 'totalRewardAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
