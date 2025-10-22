import { getPermit2Address, Permit2ABI, PERMIT_EXPIRATION, toDeadline } from '@pancakeswap/permit2-sdk'
import { PriceOrder } from '@pancakeswap/price-api-sdk'
import { CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { ConfirmModalState } from '@pancakeswap/widgets-internal'
import { Calldata } from 'hooks/usePermit2'
import { Address, encodeFunctionData, erc20Abi, Hex, hexToBigInt } from 'viem'
import { isBridgeOrder, isClassicOrder } from 'views/Swap/utils'
import { isSolana } from '@pancakeswap/chains'
import { isZero } from '../utils/isZero'

export interface BatchCall {
  to: Address
  value: bigint
  data: Hex
}

type BatchActions = Record<
  ConfirmModalState,
  {
    getCalldata?: <T = Calldata>() => T
  }
>

export function getBatchedTransaction(
  steps: ConfirmModalState[],
  actions: BatchActions,
  chainId: number,
  amountToApprove?: CurrencyAmount<Token>,
  spender?: Address,
  order?: PriceOrder,
): BatchCall[] {
  const calls: BatchCall[] = []

  for (const step of steps) {
    const action = actions[step]
    switch (step) {
      case ConfirmModalState.APPROVING_TOKEN: {
        const skipPermit = isBridgeOrder(order) && isSolana(order?.trade.outputAmount.currency.chainId)

        if (!skipPermit && amountToApprove?.currency.isToken && spender) {
          const permit2Addr = getPermit2Address(chainId)
          if (permit2Addr) {
            const approveData = encodeFunctionData({
              abi: erc20Abi,
              functionName: 'approve',
              args: [permit2Addr, BigInt(amountToApprove.quotient.toString())],
            })
            calls.push({
              to: amountToApprove.currency.address as Address,
              value: 0n,
              data: approveData,
            })
            break
          }
        }

        if (action.getCalldata) {
          const permitData = action.getCalldata()

          if (permitData) {
            calls.push({
              to: permitData.address || (amountToApprove?.currency.address as Address),
              value: permitData.value ? BigInt(permitData.value) : 0n,
              data: permitData.calldata,
            })
          }
        }
        break
      }
      case ConfirmModalState.PERMITTING:
        if (amountToApprove?.currency.isToken && spender) {
          const permit2Address = getPermit2Address(chainId)
          if (permit2Address) {
            const approveData = encodeFunctionData({
              abi: Permit2ABI,
              functionName: 'approve',
              args: [
                amountToApprove.currency.address as Address,
                spender,
                BigInt(amountToApprove.quotient.toString()),
                toDeadline(PERMIT_EXPIRATION),
              ],
            })
            calls.push({
              to: permit2Address,
              value: 0n,
              data: approveData,
            })
            break
          }
        }
        if (action.getCalldata) {
          const permit2Address = getPermit2Address(chainId)
          const permitData = action.getCalldata()

          if (permitData && permit2Address) {
            calls.push({
              to: permit2Address,
              value: 0n,
              data: permitData.calldata,
            })
          }
        }
        break
      case ConfirmModalState.PENDING_CONFIRMATION: {
        const orderSupportsBatch =
          isClassicOrder(order) || (isBridgeOrder(order) && isSolana(order?.trade.outputAmount.currency.chainId))
        if (orderSupportsBatch && action.getCalldata) {
          let swapData = action.getCalldata<Calldata[]>()

          if (swapData && !Array.isArray(swapData)) {
            swapData = [swapData]
          }
          if (swapData) {
            calls.push(
              ...swapData
                .filter((d) => d)
                .map((d) => ({
                  to: d.address,
                  value: !d.value || isZero(d.value) ? 0n : hexToBigInt(d.value),
                  data: d.calldata,
                })),
            )
          }
        }
        break
      }
      default:
        break
    }
  }
  return calls
}
