import { describe, expect, it } from 'vitest'
import { BridgeStatus, BridgeStatusData, Command } from '../../types'
import { customBridgeStatus } from '../customBridgeStatus'

/**
 * Unit tests for customBridgeStatus function
 *
 * This function determines the overall status of a bridge operation based on the status
 * of individual commands in the bridge transaction. The logic follows these rules:
 *
 * 1. If no bridge status or data is provided, return PENDING
 * 2. If data has 1 or fewer commands, return the overall bridge status
 * 3. If data has multiple commands:
 *    - If last command is SUCCESS, return SUCCESS
 *    - If any command is PENDING or BRIDGE_PENDING, return PENDING (highest priority)
 *    - If last command is FAILED and there are successful commands, return PARTIAL_SUCCESS
 *    - Otherwise return the last command's status
 */
describe('customBridgeStatus', () => {
  describe('Edge cases - undefined/empty data', () => {
    it('should return PENDING when bridgeStatus is undefined', () => {
      const result = customBridgeStatus(undefined)
      expect(result).toBe(BridgeStatus.PENDING)
    })

    it('should return PENDING when bridgeStatus has no data property', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: undefined,
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.PENDING)
    })

    it('should return PENDING when bridgeStatus has empty data array', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: [],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.PENDING)
    })
  })

  describe('Single command scenarios (data.length <= 1)', () => {
    it('should return the bridgeStatus.status for single command regardless of command status', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.FAILED,
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.FAILED)
    })
    it('should return the bridgeStatus.status for single command regardless of command status', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: [
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.SUCCESS },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.SUCCESS)
    })

    it('should handle single FAILED command with FAILED overall status', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.FAILED,
        data: [
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.FAILED },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.FAILED)
    })
  })

  describe('Multiple commands - Last command SUCCESS takes priority', () => {
    it('should return SUCCESS when last command status is SUCCESS', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.PENDING,
        data: [
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.PENDING },
          },
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.SUCCESS },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.SUCCESS)
    })

    it('should return SUCCESS even if overall status differs and last command succeeds', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: [
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.BRIDGE_PENDING },
          },
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.SUCCESS },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.SUCCESS)
    })
  })

  describe('Multiple commands - PENDING status has highest priority', () => {
    it('should return PENDING when any command has BRIDGE_PENDING status', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: [
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.PENDING },
          },
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.SUCCESS },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.SUCCESS)
    })
  })

  describe('Multiple commands - FAILED last command scenarios', () => {
    it('should return PARTIAL_SUCCESS when last command is FAILED and there are successful commands', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: [
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.FAILED },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.PARTIAL_SUCCESS)
    })

    it('should handle mixed failures correctly - return PARTIAL_SUCCESS when some succeed', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: [
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.FAILED },
          },
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.FAILED },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.PARTIAL_SUCCESS)
    })
  })

  describe('Fallback scenarios - Other status codes', () => {
    it('should return last command status for other scenarios', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: [
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.BRIDGE_PENDING },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.PENDING)
    })
  })

  describe('Complex multi-command scenarios', () => {
    it('should handle multiple commands with mixed statuses correctly - PENDING takes priority over all', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: [
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.PENDING },
          },
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.FAILED },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.PARTIAL_SUCCESS)
    })

    it('should handle scenario with four commands having complex interactions', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.PARTIAL_SUCCESS,
        data: [
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.FAILED },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.PARTIAL_SUCCESS)
    })

    it('should verify PENDING priority even in complex scenarios with many commands', () => {
      const bridgeStatus: BridgeStatusData = {
        status: BridgeStatus.SUCCESS,
        data: [
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.BRIDGE,
            status: { code: BridgeStatus.SUCCESS },
          },
          {
            command: Command.SWAP,
            status: { code: BridgeStatus.PENDING },
          },
        ],
      }
      const result = customBridgeStatus(bridgeStatus)
      expect(result).toBe(BridgeStatus.PENDING)
    })
  })
})
