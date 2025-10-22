import { BridgeStatus, BridgeStatusData } from '../types'

export function customBridgeStatus(bridgeStatus: BridgeStatusData | undefined) {
  if (!bridgeStatus) return BridgeStatus.PENDING

  if (bridgeStatus.status === BridgeStatus.FAILED) {
    return BridgeStatus.FAILED
  }

  if (!bridgeStatus.data || bridgeStatus.data.length === 0) return BridgeStatus.PENDING

  // if bridgeStatus?.data.length <= 1, use bridgeStatus.status
  if (bridgeStatus.data.length <= 1) {
    return bridgeStatus.status
  }

  // if bridgeStatus?.data.length > 1,
  // bridge status will be the last command's status
  const lastCommand = bridgeStatus.data[bridgeStatus.data.length - 1]

  if (lastCommand.status.code === BridgeStatus.SUCCESS) {
    return BridgeStatus.SUCCESS
  }

  // if the last command is failed, and other commands are success, return PARTIAL_SUCCESS
  if (lastCommand.status.code === BridgeStatus.FAILED) {
    const successCommands = bridgeStatus.data.filter((command) => command.status.code === BridgeStatus.SUCCESS)
    if (successCommands.length > 0) {
      return BridgeStatus.PARTIAL_SUCCESS
    }
  }

  // If any step is PENDING, return overall bridge status as PENDING
  if (
    bridgeStatus.data.some(
      (command) => command.status.code === BridgeStatus.PENDING || command.status.code === BridgeStatus.BRIDGE_PENDING,
    )
  ) {
    return BridgeStatus.PENDING
  }

  return lastCommand.status.code
}
