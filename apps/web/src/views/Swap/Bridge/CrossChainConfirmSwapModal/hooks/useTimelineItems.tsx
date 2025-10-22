import { PriceOrder } from '@pancakeswap/price-api-sdk'

import { useMemo } from 'react'

import { useTranslation } from '@pancakeswap/localization'

import { BridgeStatus, BridgeStatusData, Command } from '../../types'

import { customBridgeStatus } from '../../utils/customBridgeStatus'
import { TimelineItemStatus } from '../components/Timeline'
import { CrossChainAPIErrorCode, useBridgeErrorMessages } from './useBridgeErrorMessages'
import { BridgeStep } from '../BridgeStep'
import { SwapStep } from '../SwapStep'

interface UseTimelineItemsProps {
  bridgeStatus?: BridgeStatusData
  order?: PriceOrder | null
}

export const useTimelineItems = ({ bridgeStatus, order }: UseTimelineItemsProps) => {
  const { t } = useTranslation()

  const bridgeErrorMessages = useBridgeErrorMessages()

  const cstBridgeStatus = customBridgeStatus(bridgeStatus)

  const timelineItems = useMemo(() => {
    return (
      bridgeStatus?.data?.map((step, i) => {
        const getText = () => {
          switch (step.command) {
            case Command.SWAP: {
              if (!step.metadata) return ''

              return (
                <SwapStep
                  status={step.status.code}
                  originChainId={step.metadata.chainId}
                  destinationChainId={step.metadata.chainId}
                  originTokenAddress={step.metadata.inputToken}
                  destinationTokenAddress={step.metadata.outputToken}
                />
              )
            }
            case Command.BRIDGE: {
              if (!step.metadata) return ''
              const inputCurrency = order?.trade?.inputAmount?.currency
              const outputCurrency = order?.trade?.outputAmount?.currency

              const originChainId = inputCurrency?.chainId || step.metadata?.originChainId
              const destinationChainId = outputCurrency?.chainId || step.metadata?.destinationChainId
              const originTokenAddress = inputCurrency?.isNative
                ? inputCurrency?.symbol
                : inputCurrency?.wrapped.address || step.metadata?.inputToken
              const destinationTokenAddress = outputCurrency?.isNative
                ? outputCurrency?.symbol
                : outputCurrency?.wrapped.address || step.metadata?.outputToken

              return (
                <BridgeStep
                  originChainId={originChainId}
                  destinationChainId={destinationChainId}
                  originTokenAddress={originTokenAddress}
                  destinationTokenAddress={destinationTokenAddress}
                />
              )
            }
            default:
              return ''
          }
        }

        const getStatus = (): TimelineItemStatus => {
          const stepStatus = step.status.code

          // Mark everything is completed if custom bridge status is success
          if (cstBridgeStatus === BridgeStatus.SUCCESS) {
            return 'completed'
          }

          // If previous step is not completed or unsuccessful, then this step is not started
          if (
            (stepStatus === BridgeStatus.PENDING || stepStatus === BridgeStatus.BRIDGE_PENDING) &&
            bridgeStatus?.data?.[i - 1] &&
            bridgeStatus?.data?.[i - 1]?.status.code !== BridgeStatus.SUCCESS
          ) {
            return 'notStarted'
          }

          switch (stepStatus) {
            case BridgeStatus.SUCCESS:
              return 'completed'
            case BridgeStatus.PARTIAL_SUCCESS:
              return 'warning'
            case BridgeStatus.FAILED:
              return 'failed'
            case BridgeStatus.PENDING:
            case BridgeStatus.BRIDGE_PENDING:
              return 'inProgress'
            default:
              return 'notStarted'
          }
        }

        const timelineStatus = getStatus()

        const failureMessage = step.status.errorCode
          ? bridgeErrorMessages[step.status.errorCode]
          : bridgeErrorMessages[CrossChainAPIErrorCode.SERVER_ERROR] // By default, show "Unexpected error. Please try again!"

        // Transaction Hash and ChainId
        const getTx = () => {
          if (step.command === Command.BRIDGE) {
            if (!step.metadata) return undefined

            // If bridge is the first step (and other steps exist), use origin chain and hash
            if (i === 0 && bridgeStatus?.data && bridgeStatus?.data.length > 1) {
              return {
                hash: step.metadata.depositTxHash,
                chainId: step.metadata.originChainId,
              }
            }

            return {
              hash: step.metadata.fillTx || step.metadata.depositRefundTxHash || step.metadata.depositTxHash,
              chainId: step.metadata.fillTx ? step.metadata.destinationChainId : step.metadata.originChainId,
            }
          }

          if (step.command === Command.SWAP) {
            if (!step.metadata) return undefined

            return {
              hash: step.metadata.tx,
              chainId: step.metadata.chainId,
            }
          }

          return undefined
        }

        const tx = getTx()

        return {
          id: step.command,
          title: getText(),
          status: timelineStatus,
          isLast: bridgeStatus?.data && step.command === bridgeStatus?.data[bridgeStatus?.data.length - 1]?.command,
          ...(failureMessage
            ? timelineStatus === 'failed'
              ? { errorMessage: failureMessage }
              : { warningMessage: failureMessage }
            : undefined),
          tx,
        }
      }) ?? []
    )
  }, [bridgeStatus, cstBridgeStatus, order, t, bridgeErrorMessages])

  return timelineItems
}
