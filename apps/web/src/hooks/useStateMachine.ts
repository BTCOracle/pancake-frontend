import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface StateMachineConfig<TState extends string, TEvent extends string> {
  initialState: TState
  states: Record<
    TState,
    {
      on?: Partial<
        Record<
          TEvent,
          {
            target: TState
            guard?: () => boolean
            action?: () => void
          }
        >
      >
      entry?: () => void
      exit?: () => void
    }
  >
}

export interface StateMachineInstance<TState extends string, TEvent extends string> {
  currentState: TState
  send: (event: TEvent) => void
  reset: () => void
  is: (state: TState) => boolean
}

export function useStateMachine<TState extends string, TEvent extends string>(
  config: StateMachineConfig<TState, TEvent>,
  dependencies: React.DependencyList = [],
): StateMachineInstance<TState, TEvent> {
  const stateRef = useRef<TState>(config.initialState)
  const configRef = useRef(config)
  const [, forceUpdate] = useState({})

  // Force re-render when state changes
  const triggerUpdate = useCallback(() => {
    forceUpdate({})
  }, [])

  // Update config ref when config changes
  configRef.current = config

  const send = useCallback(
    (event: TEvent) => {
      const currentState = stateRef.current
      const stateConfig = configRef.current.states[currentState]
      const transition = stateConfig.on?.[event]

      if (!transition) {
        // No transition defined for this event in current state
        return
      }

      // Check guard condition if present
      if (transition.guard && !transition.guard()) {
        return
      }

      // Execute exit action of current state
      stateConfig.exit?.()

      // Execute transition action
      transition.action?.()

      // Transition to new state
      const newState = transition.target
      stateRef.current = newState

      // Execute entry action of new state
      configRef.current.states[newState].entry?.()

      // Trigger re-render
      triggerUpdate()
    },
    [triggerUpdate],
  )

  const reset = useCallback(() => {
    const currentState = stateRef.current
    const initialState = configRef.current.initialState

    if (currentState !== initialState) {
      // Execute exit action of current state
      configRef.current.states[currentState].exit?.()

      // Reset to initial state
      stateRef.current = initialState

      // Execute entry action of initial state
      configRef.current.states[initialState].entry?.()

      // Trigger re-render
      triggerUpdate()
    }
  }, [triggerUpdate])

  const is = useCallback((state: TState) => {
    return stateRef.current === state
  }, [])

  // Execute initial entry action
  useEffect(() => {
    configRef.current.states[config.initialState].entry?.()
  }, [])

  // Auto-reset when dependencies change
  useEffect(() => {
    reset()
  }, [...dependencies, config])

  return useMemo(
    () => ({
      currentState: stateRef.current,
      send,
      reset,
      is,
    }),
    [send, reset, is, stateRef.current],
  )
}

// Utility type for defining state machine configurations
export type CreateStateMachine<TState extends string, TEvent extends string> = StateMachineConfig<TState, TEvent>
