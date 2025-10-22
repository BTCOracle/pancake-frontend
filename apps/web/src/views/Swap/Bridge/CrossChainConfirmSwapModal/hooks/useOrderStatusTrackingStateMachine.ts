import { useEffect, useMemo } from 'react'
import { CreateStateMachine, useStateMachine } from '../../../../../hooks/useStateMachine'
import { logGTMOrderStatusEvent } from '../../../../../utils/customGTMEventTracking'
import { BridgeStatus } from '../../types'

type OrderStatusState = 'idle' | 'pending' | 'completed'
type OrderStatusEvent = 'START_TRACKING' | 'ORDER_SUCCESS' | 'ORDER_FAILED'

export const useOrderStatusTrackingStateMachine = (status?: BridgeStatus) => {
  // Don't track if status is undefined
  const shouldTrack = status !== undefined

  // Create state machine configuration
  const stateMachineConfig: CreateStateMachine<OrderStatusState, OrderStatusEvent> = useMemo(() => {
    if (!shouldTrack) {
      return {
        initialState: 'idle',
        states: {
          idle: {},
          pending: {},
          completed: {},
        },
      }
    }

    return {
      initialState: 'idle',
      states: {
        idle: {
          on: {
            START_TRACKING: {
              target: 'pending',
              guard: () => {
                // Start tracking when status is PENDING or BRIDGE_PENDING and status is defined
                return status === BridgeStatus.PENDING || status === BridgeStatus.BRIDGE_PENDING
              },
              action: () => {
                // Log the start of order status tracking
                if (status) {
                  logGTMOrderStatusEvent(status)
                }
              },
            },
          },
        },
        pending: {
          on: {
            ORDER_SUCCESS: {
              target: 'completed',
              guard: () => {
                // Transition to success when status is SUCCESS
                return status === BridgeStatus.SUCCESS
              },
              action: () => {
                if (status) {
                  logGTMOrderStatusEvent(status)
                }
              },
            },
            ORDER_FAILED: {
              target: 'completed',
              guard: () => {
                // Transition to failed when status is FAILED or PARTIAL_SUCCESS
                return shouldTrack && (status === BridgeStatus.FAILED || status === BridgeStatus.PARTIAL_SUCCESS)
              },
              action: () => {
                if (status) {
                  logGTMOrderStatusEvent(status)
                }
              },
            },
          },
        },
        completed: {
          // Terminal state - no transitions out
        },
      },
    }
  }, [status, shouldTrack])

  // Initialize state machine with auto-reset dependencies
  const stateMachine = useStateMachine(stateMachineConfig, [])

  // Trigger state transitions based on status changes
  useEffect(() => {
    if (shouldTrack && stateMachine.is('idle')) {
      stateMachine.send('START_TRACKING')
    }
  }, [status, stateMachine, shouldTrack])

  useEffect(() => {
    if (shouldTrack && stateMachine.is('pending')) {
      if (status === BridgeStatus.SUCCESS || status === BridgeStatus.PARTIAL_SUCCESS) {
        stateMachine.send('ORDER_SUCCESS')
      } else if (status === BridgeStatus.FAILED) {
        stateMachine.send('ORDER_FAILED')
      }
    }
  }, [status, stateMachine, shouldTrack])

  return stateMachine
}
