export const ifoV10Abi = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'MAX_BUFFER_SECONDS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MAX_POOL_ID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'NATIVE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addresses',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'computeNextVestingScheduleIdForHolder',
    inputs: [
      {
        name: '_holder',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'computeReleasableAmount',
    inputs: [
      {
        name: '_vestingScheduleId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'computeVestingScheduleIdForAddressAndIndex',
    inputs: [
      {
        name: '_holder',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'computeVestingScheduleIdForAddressAndPid',
    inputs: [
      {
        name: '_holder',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_pid',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'depositPool',
    inputs: [
      {
        name: '_amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_pid',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'endTimestamp',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'finalWithdraw',
    inputs: [
      {
        name: '_lp0Amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_lp1Amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_offerAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getVestingSchedule',
    inputs: [
      {
        name: '_vestingScheduleId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IFOInitializableV10.VestingSchedule',
        components: [
          {
            name: 'isVestingInitialized',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'beneficiary',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'pid',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'amountTotal',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'released',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVestingScheduleByAddressAndIndex',
    inputs: [
      {
        name: '_holder',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IFOInitializableV10.VestingSchedule',
        components: [
          {
            name: 'isVestingInitialized',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'beneficiary',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'pid',
            type: 'uint8',
            internalType: 'uint8',
          },
          {
            name: 'amountTotal',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'released',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVestingSchedulesCount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVestingSchedulesTotalAmount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWithdrawableOfferingTokenAmount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'harvestPool',
    inputs: [
      {
        name: '_pid',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_addresses',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: '_startAndEndTimestamps',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_maxBufferSeconds',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxPoolId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: '_vestingStartTime',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'recoverWrongTokens',
    inputs: [
      {
        name: '_tokenAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_tokenAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'release',
    inputs: [
      {
        name: '_vestingScheduleId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revoke',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPool',
    inputs: [
      {
        name: '_offeringAmountPool',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_raisingAmountPool',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_limitPerUserInLP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_hasTax',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_flatTaxRate',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_pid',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: '_vestingConfig',
        type: 'tuple',
        internalType: 'struct IIFOV10.VestingConfig',
        components: [
          {
            name: 'percentage',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'cliff',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'duration',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'slicePeriodSeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'startTimestamp',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalTokensOffered',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateStartAndEndTimestamps',
    inputs: [
      {
        name: '_startAndEndTimestamps',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'vestingRevoked',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'vestingStartTime',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewPoolInformation',
    inputs: [
      {
        name: '_pid',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewPoolTaxRateOverflow',
    inputs: [
      {
        name: '_pid',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewPoolVestingInformation',
    inputs: [
      {
        name: '_pid',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewUserAllocationPools',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_pids',
        type: 'uint8[]',
        internalType: 'uint8[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewUserInfo',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_pids',
        type: 'uint8[]',
        internalType: 'uint8[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '',
        type: 'bool[]',
        internalType: 'bool[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'viewUserOfferingAndRefundingAmountsForPools',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_pids',
        type: 'uint8[]',
        internalType: 'uint8[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256[3][]',
        internalType: 'uint256[3][]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AdminTokenRecovery',
    inputs: [
      {
        name: 'tokenAddress',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'amountTokens',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AdminWithdraw',
    inputs: [
      {
        name: 'amountLP0',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amountLP1',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amountOfferingToken',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CreateVestingSchedule',
    inputs: [
      {
        name: 'user',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'offeringAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'excessAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'pid',
        type: 'uint8',
        indexed: true,
        internalType: 'uint8',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Deposit',
    inputs: [
      {
        name: 'user',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'pid',
        type: 'uint8',
        indexed: true,
        internalType: 'uint8',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Harvest',
    inputs: [
      {
        name: 'user',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'offeringAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'excessAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'pid',
        type: 'uint8',
        indexed: true,
        internalType: 'uint8',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewStartAndEndTimestamps',
    inputs: [
      {
        name: 'startTimestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'endTimestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PoolParametersSet',
    inputs: [
      {
        name: 'offeringAmountPool',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'raisingAmountPool',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'pid',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Released',
    inputs: [
      {
        name: 'beneficiary',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Revoked',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AddressesLengthNotCorrect',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyHarvested',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AmountMustExceedZero',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DidNotParticipate',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EndTimeTooFar',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FlatTaxRateMustBe0WhenHasTaxIsFalse',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FlatTaxRateMustBeLessThan1e12',
    inputs: [],
  },
  {
    type: 'error',
    name: 'IFOHasStarted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidToken',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidVestingConfig',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NativeTransferFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NewAmountAboveUserLimit',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PoolIdNotValid',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PoolNotSet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Reentrancy',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ShouldNotLargerThanTheNumberOfPools',
    inputs: [],
  },
  {
    type: 'error',
    name: 'StartAndEndTimestampsLengthNotCorrect',
    inputs: [],
  },
  {
    type: 'error',
    name: 'StartTimeMustGreaterThanCurrentBlockTime',
    inputs: [],
  },
  {
    type: 'error',
    name: 'StartTimeMustInferiorToEndTime',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TokensNotDepositedProperly',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TooEarly',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TooLate',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VestingDurationMustExceeds0',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VestingIsRevoked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VestingNotEnoughToRelease',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VestingNotExist',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VestingOnlyBeneficiaryOrOwnerCanRelease',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VestingPercentageShouldRangeIn0And100',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VestingSlicePerSecondsMustBeExceeds1',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VestingSlicePerSecondsMustBeInteriorDuration',
    inputs: [],
  },
] as const
