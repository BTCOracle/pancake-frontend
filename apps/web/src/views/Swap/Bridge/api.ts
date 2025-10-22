import { BridgeTrade, BridgeTransactionData, OrderType } from '@pancakeswap/price-api-sdk'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { InfinityTradeWithoutGraph } from '@pancakeswap/smart-router/dist/evm/infinity-router'
import { BRIDGE_API_ENDPOINT } from 'config/constants/endpoints'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { Address } from 'viem/accounts'
import { isSolana } from '@pancakeswap/chains'
import { ExclusiveDutchOrderTrade } from '@pancakeswap/pcsx-sdk'
import { SOLANA_NATIVE_TOKEN_ADDRESS } from 'quoter/consts'
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionInstruction,
  ComputeBudgetProgram,
  TransactionMessage,
} from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { buildTransaction, detectWalletTransactionSupport } from 'components/WalletModalV2/utils/solanaSendTransaction'
import { Calldata } from 'hooks/usePermit2'
import { BridgeTradeError } from 'quoter/quoter.types'
import { getSimulationComputeUnits } from 'utils/getSimulationComputeUnits'
import { BridgeOrderWithCommands, isSVMOrder } from '../utils'
import {
  BridgeDataSchema,
  BridgeStatusResponse,
  BridgeType,
  CalldataRequestSchema,
  Command,
  GetBridgeCalldataResponse,
  Permit2Schema,
  SwapDataSchema,
  UserBridgeOrdersResponse,
} from './types'
import { convertStepsIntoTransactionInstruction } from './utils/relay'

export function getSolanaTokenAddress(currency: Currency): string {
  if (!isSolana(currency.chainId)) {
    throw new Error('getSolanaTokenAddress only supports solana currencies')
  }

  return currency.isNative ? SOLANA_NATIVE_TOKEN_ADDRESS : currency.wrapped.address
}

export function getTokenAddress(currency: Currency): Address {
  return currency.isNative ? '0x0000000000000000000000000000000000000000' : currency.wrapped.address
}

export function getUnifiedTokenAddress(currency: Currency): string {
  if (isSolana(currency.chainId)) {
    return getSolanaTokenAddress(currency)
  }
  return getTokenAddress(currency)
}

export function generateBridgeCommands({
  trade,
  refundAddress,
  bridgeTransactionData,
}: {
  trade: BridgeTrade<TradeType>
  refundAddress: Address
  bridgeTransactionData: BridgeTransactionData
}): BridgeDataSchema {
  return {
    command: Command.BRIDGE,
    data: {
      inputToken: getTokenAddress(trade.inputAmount.currency),
      outputToken: getTokenAddress(trade.outputAmount.currency),

      inputAmount: trade.inputAmount.quotient.toString(),
      originChainId: trade.inputAmount.currency.chainId,
      destinationChainId: trade.outputAmount.currency.chainId,
      originChainRecipient: refundAddress,
      minOutputAmount: trade.outputAmount.quotient.toString(),
      bridgeTransactionData,
    },
  }
}

export function generateSwapCommands({
  trade,
  allowedSlippage,
}: {
  trade: InfinityTradeWithoutGraph<TradeType> | ExclusiveDutchOrderTrade<Currency, Currency>
  allowedSlippage: number
}): SwapDataSchema {
  return {
    command: Command.SWAP,
    data: {
      originChainId: trade.inputAmount.currency.chainId,
      trade: JSON.parse(JSON.stringify(trade, replacer, 2)),
      slippageTolerance: allowedSlippage,
    },
  }
}

const replacer = (_, value: string | bigint) => {
  return typeof value === 'bigint' ? value.toString() : value
}

export const getSolanaBridgeCalldata = async ({
  order,
  recipient,
  user,
  allowedSlippage,
}: {
  order: BridgeOrderWithCommands
  recipient: string
  user: string
  allowedSlippage?: number
}) => {
  const { requestId } = order.bridgeTransactionData as any

  if (!allowedSlippage || !user || !recipient || !requestId) {
    throw new Error('getSolanaBridgeCalldata requires allowedSlippage, user, recipient, and requestId')
  }

  const calldataRequest: CalldataRequestSchema = {
    requestId,
    inputToken: getUnifiedTokenAddress(order.trade.inputAmount.currency),
    outputToken: getUnifiedTokenAddress(order.trade.outputAmount.currency),
    inputAmount: order.trade.inputAmount.quotient.toString(),
    originChainId: order.trade.inputAmount.currency.chainId,
    destinationChainId: order.trade.outputAmount.currency.chainId,
    recipientOnDestChain: recipient,
    user,
    type: BridgeType.NON_EVM,
    slippageTolerance: allowedSlippage,
  }

  const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/calldata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(calldataRequest),
  })

  const data = await resp.json()

  if (!data.requestId) {
    throw new Error('Server error when getting solana bridge calldata')
  }

  if (
    data.requestId !== requestId &&
    data.bridgeTransactionData.outputAmount !== order.trade.outputAmount.quotient.toString()
  ) {
    console.info(
      'Quote Outdated',
      `Current OutputAmount: ${order.trade.outputAmount.quotient.toString()}`,
      `New OutputAmount: ${data.bridgeTransactionData.outputAmount}`,
    )
    // NOTE: return undefined so quote can be updated
    return undefined
  }

  return data
}

export const getSolanaToEVMBridgeCalldata = async ({
  order,
  solanaConnection,
  solanaWalletContext,
  allowedSlippage,
  user,
  recipient,
}: {
  order: BridgeOrderWithCommands
  solanaConnection: Connection
  solanaWalletContext: WalletContextState
  allowedSlippage?: number
  user: string
  recipient: string
}): Promise<Transaction | VersionedTransaction | undefined> => {
  if (!isSolana(order.trade.inputAmount.currency.chainId)) {
    throw new Error('getSolanaToEVMBridgeCalldata requires Solana as origin chain')
  }

  if (!solanaWalletContext.publicKey) {
    throw new Error('Solana wallet not connected')
  }

  const data = await getSolanaBridgeCalldata({ order, recipient, user, allowedSlippage })

  if (!data) {
    return undefined
  }

  const rawInstructions = data?.steps?.[0]?.items?.[0]?.data?.instructions || []

  let instructions = convertStepsIntoTransactionInstruction(rawInstructions)

  // Detect wallet transaction support
  const walletSupportsV0 = detectWalletTransactionSupport(solanaWalletContext)

  const addressLookupTableAddresses = data?.steps?.[0]?.items?.[0]?.data?.addressLookupTableAddresses

  const lookupTableAddresses =
    addressLookupTableAddresses?.length > 0
      ? ((
          await Promise.all(
            addressLookupTableAddresses.map((address) =>
              solanaConnection.getAddressLookupTable(new PublicKey(address)),
            ),
          ).then((addresses) => addresses.map((address) => address.value))
        ).filter(Boolean) as AddressLookupTableAccount[])
      : []

  // Get the estimated compute units
  const computeUnits = await getSimulationComputeUnits(
    solanaConnection,
    instructions,
    solanaWalletContext.publicKey,
    lookupTableAddresses,
  )

  // Why need to set compute units limit?
  // Some wallets don't support compute units limit before sending transaction
  // Therefore, it will submit failed transaction due to insufficient compute units
  instructions = computeUnits
    ? [
        ComputeBudgetProgram.setComputeUnitLimit({
          units: computeUnits,
        }),
        ...instructions,
      ]
    : instructions

  const transaction = await buildTransaction(
    instructions,
    solanaConnection,
    solanaWalletContext.publicKey,
    walletSupportsV0,
    lookupTableAddresses,
  )

  return transaction
}

export const getBridgeCalldata = async ({
  order,
  account,
  recipient,
  permit2,
  allowedSlippage,
}: {
  order: BridgeOrderWithCommands
  account: Address
  recipient: Address
  permit2?: Permit2Schema
  allowedSlippage: number
}) => {
  try {
    if (!Array.isArray(order?.commands)) {
      throw new Error('No bridge commands found')
    }

    const commands: (BridgeDataSchema | SwapDataSchema)[] = order.commands.map((command) => {
      if (isSVMOrder(command)) {
        throw new Error('SVM order not supported for bridge')
      }

      if (command.type === OrderType.PCS_BRIDGE) {
        return generateBridgeCommands({
          trade: command.trade,
          refundAddress: account,
          bridgeTransactionData: command.bridgeTransactionData,
        })
      }

      return generateSwapCommands({
        trade: command.trade,
        allowedSlippage,
      })
    })

    const calldataRequest: CalldataRequestSchema = {
      inputToken: getTokenAddress(order.trade.inputAmount.currency),
      outputToken: getTokenAddress(order.trade.outputAmount.currency),
      inputAmount: order.trade.inputAmount.quotient.toString(),
      originChainId: order.trade.inputAmount.currency.chainId,
      destinationChainId: order.trade.outputAmount.currency.chainId,
      recipientOnDestChain: recipient,
      commands,
      permit2,
      type: BridgeType.EVM,
    }

    const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/calldata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calldataRequest),
    })

    const data = (await resp.json()) as GetBridgeCalldataResponse
    return {
      transactionData: {
        address: data.transactionData.router,
        calldata: data.transactionData.calldata,
        value: order.trade.inputAmount.currency.isNative
          ? BigInt(order.trade.inputAmount.quotient.toString())
          : undefined,
      } as Calldata,
      gasFee: data.gasFee,
    }
  } catch (error) {
    console.error('getBridgeCalldata Error', error)
    throw error
  }
}

export type Permit2ResponseSchema = {
  amount: string
  expiration: number
  nonce: number
}

export type PostBridgeCheckApprovalResponse = {
  isApprovalRequired: boolean
  isPermit2Required: boolean
  permit2Address: Address
  spender: Address
  permit2Details?: Permit2ResponseSchema
  tokenAddress?: `0x${string}`
  walletAddress?: `0x${string}`
  data?: `0x${string}`

  error?: {
    code: string
    message: string
  }
}

export const postBridgeCheckApproval = async ({
  currencyAmountIn,
  recipient,
}: {
  currencyAmountIn: CurrencyAmount<Currency>
  recipient: Address
}) => {
  try {
    const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/check-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: recipient,
        tokenAddress: getTokenAddress(currencyAmountIn.currency),
        amount: currencyAmountIn.quotient.toString(),
        chainId: currencyAmountIn.currency.chainId,
      }),
    })

    const data = (await resp.json()) as PostBridgeCheckApprovalResponse
    return data
  } catch (error) {
    console.error('postBridgeCheckApproval Error', error)
    throw error
  }
}

export interface Route {
  originChainId: number
  destinationChainId: number
  originToken: string
  destinationToken: string
  destinationTokenSymbol: string
}

export type GetAvailableRoutesParams = {
  originChainId?: number
  destinationChainId?: number
  originToken?: string
  destinationToken?: string
}

export const getBridgeAvailableRoutes = async (params: GetAvailableRoutesParams) => {
  const stringParams = Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, value?.toString()]),
  )
  const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/routes?${new URLSearchParams(stringParams).toString()}`)
  const data = (await resp.json()) as { routes: Route[] }
  return data?.routes
}

export type Metadata = {
  // Define the metadata structure based on backend response
  routes?: Route[]
  quote?: {
    outputAmount: string
    minOutputAmount: string
    gasFee?: string
  }
  // Add additional fields as needed
}

export type GetMetadataParams = {
  // using string instead of Address to support both evm and solana
  inputToken: string
  originChainId: number | string
  outputToken: string
  destinationChainId: number | string
  amount: string
  commands?: (BridgeDataSchema | SwapDataSchema)[]
  recipientOnDestChain?: string
  user?: string
  slippageTolerance?: string
  type?: BridgeType
}

export type GetSolanaEVMBridgeMetadataParams = {
  inputToken: string
  originChainId: number | string
  outputToken: string
  destinationChainId: number | string
  amount: string
  recipientOnDestChain?: string | null
  user?: string | null
  slippageTolerance?: string
}

export interface MetadataResponse {
  supported: boolean
  error?: {
    code: string
    message: string
    description?: string
  }
  reason?: string
}

export interface MetadataSuccessResponse extends MetadataResponse {
  amount: string
  inputToken: string
  originChainId: number
  outputToken: string
  destinationChainId: number
  expectedFillTimeSec: string
  isAmountTooLow: boolean
  limits: {
    minDeposit: string
    maxDeposit: string
    maxDepositInstant: string
    maxDepositShortDelay: string
    recommendedDepositInstant: string
  }
  bridgeTransactionData: BridgeTransactionData
  requestId?: string
}

export const postSolanaEVMBridgeMetadata = async (
  params: GetSolanaEVMBridgeMetadataParams,
): Promise<MetadataSuccessResponse> => {
  const {
    recipientOnDestChain,
    user,
    originChainId,
    destinationChainId,
    inputToken,
    outputToken,
    amount,
    slippageTolerance,
  } = params

  const isOriginSolana = isSolana(Number(originChainId))
  const isDestinationSolana = isSolana(Number(destinationChainId))

  const isSolanaBridge = isOriginSolana || isDestinationSolana

  if (!isSolanaBridge) {
    throw new Error('postSolanaEVMBridgeMetadata only supports Solana bridge')
  }

  try {
    const metadataResponse = await postMetadata({
      inputToken,
      originChainId,
      outputToken,
      destinationChainId,
      amount,
      user: user || undefined,
      recipientOnDestChain: recipientOnDestChain || undefined,
      slippageTolerance,
      type: BridgeType.NON_EVM,
    })

    if (!metadataResponse?.supported) {
      throw new BridgeTradeError(metadataResponse?.reason || metadataResponse?.error?.code)
    }

    const result: MetadataSuccessResponse = {
      supported: true,
      amount: metadataResponse.amount,
      inputToken: metadataResponse.inputToken,
      originChainId: Number(metadataResponse.originChainId),
      outputToken: metadataResponse.outputToken,
      destinationChainId: Number(metadataResponse.destinationChainId),
      expectedFillTimeSec: metadataResponse.expectedFillTimeSec.toString(),
      isAmountTooLow: false,
      limits: {
        minDeposit: '0',
        maxDeposit: '0',
        maxDepositInstant: '0',
        maxDepositShortDelay: '0',
        recommendedDepositInstant: '0',
      },
      bridgeTransactionData: {
        requestId: metadataResponse.requestId,
        minimumOutputAmount: metadataResponse.bridgeTransactionData.minimumOutputAmount?.toString(),
        outputAmount: metadataResponse.bridgeTransactionData.outputAmount?.toString(),
        totalRelayFee: metadataResponse.bridgeTransactionData.totalFee?.toString() || '0',
        totalImpactPct: metadataResponse.bridgeTransactionData.totalImpactPct?.toString(),
        // add placeholder for other fields to compatiable with Across
        exclusiveRelayer: '',
        exclusivityDeadline: 0,
        fillDeadline: 0,
        quoteTimestamp: 0,
        relayerFeePct: '0',
      },
    }

    return result
  } catch (error: any) {
    throw new BridgeTradeError(error?.message || error?.error?.code || 'Bridge Trade Unknown error')
  }
}

function generateUrlParams(obj: Record<string, any>) {
  const stringParams = Object.fromEntries(
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, value?.toString()]),
  )
  return new URLSearchParams(stringParams).toString()
}

export const postMetadata = async (params: GetMetadataParams): Promise<MetadataSuccessResponse> => {
  const { commands, recipientOnDestChain, slippageTolerance, type, user, ...rest } = params

  const resp = await fetch(`${BRIDGE_API_ENDPOINT}/v1/metadata?${generateUrlParams(rest)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipientOnDestChain,
      commands,
      type,
      slippageTolerance: slippageTolerance ? Number(slippageTolerance) : undefined,
      user,
    }),
  })

  return resp.json()
}

export const getBridgeStatus = async (
  chainId: number,
  txHash: string,
  destinationChainId?: number,
): Promise<BridgeStatusResponse> => {
  const type = isSolana(destinationChainId) || isSolana(chainId) ? BridgeType.NON_EVM : BridgeType.EVM

  const resp = await fetch(
    `${BRIDGE_API_ENDPOINT}/v1/status/${
      isSolana(chainId) ? 'sol' : chainIdToExplorerInfoChainName[chainId]
    }?txHash=${txHash}&type=${type}`,
  )
  return resp.json()
}

export const getUserBridgeOrders = async (
  address: Address,
  params?: {
    after?: string
  },
): Promise<UserBridgeOrdersResponse> => {
  const resp = await fetch(
    `${BRIDGE_API_ENDPOINT}/v1/orders/${address}${params?.after ? `?after=${params.after}` : ''}`,
  )
  return resp.json()
}

export const getUserBridgeOrdersV2 = async (
  address: string,
  params?: {
    after?: string
    continuation?: string
  },
): Promise<{ EVM: UserBridgeOrdersResponse; ['NON-EVM']: UserBridgeOrdersResponse }> => {
  const resp = await fetch(
    `${BRIDGE_API_ENDPOINT}/v2/orders/${address}${
      params?.after || params?.continuation ? `?${generateUrlParams(params)}` : ''
    }`,
  )
  return resp.json()
}
