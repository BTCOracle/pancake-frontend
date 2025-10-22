import { act, renderHook } from '@testing-library/react-hooks'
import { describe, expect, it, vi } from 'vitest'
import { StateMachineConfig, useStateMachine } from '../useStateMachine'

// Define test state machine types
type TestState = 'idle' | 'loading' | 'success' | 'error'
type TestEvent = 'FETCH' | 'SUCCESS' | 'ERROR' | 'RESET'

describe('useStateMachine', () => {
  describe('Basic functionality', () => {
    it('should initialize with the initial state', () => {
      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {},
          loading: {},
          success: {},
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      expect(result.current.currentState).toBe('idle')
      expect(result.current.is('idle')).toBe(true)
      expect(result.current.is('loading')).toBe(false)
    })

    it('should transition between states when valid events are sent', () => {
      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            on: {
              FETCH: { target: 'loading' },
            },
          },
          loading: {
            on: {
              SUCCESS: { target: 'success' },
              ERROR: { target: 'error' },
            },
          },
          success: {},
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      // Initial state
      expect(result.current.currentState).toBe('idle')
      expect(result.current.is('idle')).toBe(true)

      // Transition from idle to loading
      act(() => {
        result.current.send('FETCH')
      })

      expect(result.current.currentState).toBe('loading')
      expect(result.current.is('loading')).toBe(true)
      expect(result.current.is('idle')).toBe(false)

      // Transition from loading to success
      act(() => {
        result.current.send('SUCCESS')
      })

      expect(result.current.currentState).toBe('success')
      expect(result.current.is('success')).toBe(true)
      expect(result.current.is('loading')).toBe(false)
    })

    it('should ignore invalid events that have no transition defined', () => {
      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            on: {
              FETCH: { target: 'loading' },
            },
          },
          loading: {},
          success: {},
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      expect(result.current.currentState).toBe('idle')

      // Send an invalid event from idle state
      act(() => {
        result.current.send('SUCCESS') // This should be ignored
      })

      expect(result.current.currentState).toBe('idle') // Should remain in idle
    })
  })

  describe('Guards and Actions', () => {
    it('should respect guard conditions', () => {
      let shouldAllow = false
      const guardSpy = vi.fn(() => shouldAllow)

      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            on: {
              FETCH: {
                target: 'loading',
                guard: guardSpy,
              },
            },
          },
          loading: {},
          success: {},
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      // Guard should prevent transition
      act(() => {
        result.current.send('FETCH')
      })

      expect(guardSpy).toHaveBeenCalled()
      expect(result.current.currentState).toBe('idle') // Should remain in idle

      // Allow transition
      shouldAllow = true
      act(() => {
        result.current.send('FETCH')
      })

      expect(result.current.currentState).toBe('loading') // Should transition
    })

    it('should execute transition actions', () => {
      const transitionAction = vi.fn()

      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            on: {
              FETCH: {
                target: 'loading',
                action: transitionAction,
              },
            },
          },
          loading: {},
          success: {},
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      act(() => {
        result.current.send('FETCH')
      })

      expect(transitionAction).toHaveBeenCalledTimes(1)
      expect(result.current.currentState).toBe('loading')
    })

    it('should execute entry and exit actions', () => {
      const idleExit = vi.fn()
      const loadingEntry = vi.fn()

      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            exit: idleExit,
            on: {
              FETCH: { target: 'loading' },
            },
          },
          loading: {
            entry: loadingEntry,
          },
          success: {},
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      act(() => {
        result.current.send('FETCH')
      })

      expect(idleExit).toHaveBeenCalledTimes(1)
      expect(loadingEntry).toHaveBeenCalledTimes(1)
    })

    it('should execute actions in correct order: exit -> transition -> entry', () => {
      const actionOrder: string[] = []
      const idleExit = vi.fn(() => actionOrder.push('idle-exit'))
      const transitionAction = vi.fn(() => actionOrder.push('transition'))
      const loadingEntry = vi.fn(() => actionOrder.push('loading-entry'))

      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            exit: idleExit,
            on: {
              FETCH: {
                target: 'loading',
                action: transitionAction,
              },
            },
          },
          loading: {
            entry: loadingEntry,
          },
          success: {},
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      act(() => {
        result.current.send('FETCH')
      })

      expect(actionOrder).toEqual(['idle-exit', 'transition', 'loading-entry'])
    })
  })

  describe('Reset functionality', () => {
    it('should reset to initial state', () => {
      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            on: {
              FETCH: { target: 'loading' },
            },
          },
          loading: {
            on: {
              SUCCESS: { target: 'success' },
            },
          },
          success: {},
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      // Transition to success state
      act(() => {
        result.current.send('FETCH')
      })
      act(() => {
        result.current.send('SUCCESS')
      })

      expect(result.current.currentState).toBe('success')

      // Reset to initial state
      act(() => {
        result.current.reset()
      })

      expect(result.current.currentState).toBe('idle')
      expect(result.current.is('idle')).toBe(true)
    })

    it('should execute exit and entry actions during reset', () => {
      const successExit = vi.fn()
      const idleEntry = vi.fn()

      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            entry: idleEntry,
            on: {
              FETCH: { target: 'success' },
            },
          },
          loading: {},
          success: {
            exit: successExit,
          },
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      // Initial entry should have been called
      expect(idleEntry).toHaveBeenCalledTimes(1)

      // Transition to success
      act(() => {
        result.current.send('FETCH')
      })

      expect(result.current.currentState).toBe('success')

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(successExit).toHaveBeenCalledTimes(1)
      expect(idleEntry).toHaveBeenCalledTimes(2) // Once on init, once on reset
    })

    it('should not execute exit/entry actions if already in initial state', () => {
      const idleExit = vi.fn()
      const idleEntry = vi.fn()

      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            entry: idleEntry,
            exit: idleExit,
          },
          loading: {},
          success: {},
          error: {},
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      // Clear the initial entry call
      idleEntry.mockClear()

      // Reset while already in initial state
      act(() => {
        result.current.reset()
      })

      expect(idleExit).not.toHaveBeenCalled()
      expect(idleEntry).not.toHaveBeenCalled()
    })
  })

  describe('Dependencies and auto-reset', () => {
    it('should auto-reset when dependencies change', () => {
      const config: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            on: {
              FETCH: { target: 'loading' },
            },
          },
          loading: {},
          success: {},
          error: {},
        },
      }

      let dependency = 'initial'
      const { result, rerender } = renderHook(({ dep }) => useStateMachine(config, [dep]), {
        initialProps: { dep: dependency },
      })

      // Transition to loading state
      act(() => {
        result.current.send('FETCH')
      })

      expect(result.current.currentState).toBe('loading')

      // Change dependency - should trigger auto-reset
      dependency = 'changed'
      rerender({ dep: dependency })

      expect(result.current.currentState).toBe('idle')
    })

    it('should update config when config changes', () => {
      const initialConfig: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            on: {
              FETCH: { target: 'loading' },
            },
          },
          loading: {},
          success: {},
          error: {},
        },
      }

      const { result, rerender } = renderHook(({ config }) => useStateMachine(config), {
        initialProps: { config: initialConfig },
      })

      // Transition to loading
      act(() => {
        result.current.send('FETCH')
      })

      expect(result.current.currentState).toBe('loading')

      // Update config with new transitions
      const newConfig: StateMachineConfig<TestState, TestEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            on: {
              FETCH: { target: 'success' }, // Changed target
            },
          },
          loading: {},
          success: {},
          error: {},
        },
      }

      rerender({ config: newConfig })

      // Reset to idle first (due to dependencies changing)
      expect(result.current.currentState).toBe('idle')

      // Now test with new config
      act(() => {
        result.current.send('FETCH')
      })

      expect(result.current.currentState).toBe('success') // Should use new config
    })
  })

  describe('Complex state machine scenario', () => {
    it('should handle a complete async data fetching flow', () => {
      const fetchStartAction = vi.fn()
      const fetchSuccessAction = vi.fn()
      const fetchErrorAction = vi.fn()
      const retryGuard = vi.fn(() => true)

      type AsyncState = 'idle' | 'loading' | 'success' | 'error' | 'retrying'
      type AsyncEvent = 'FETCH' | 'SUCCESS' | 'ERROR' | 'RETRY' | 'RESET'

      const config: StateMachineConfig<AsyncState, AsyncEvent> = {
        initialState: 'idle',
        states: {
          idle: {
            on: {
              FETCH: {
                target: 'loading',
                action: fetchStartAction,
              },
            },
          },
          loading: {
            on: {
              SUCCESS: {
                target: 'success',
                action: fetchSuccessAction,
              },
              ERROR: {
                target: 'error',
                action: fetchErrorAction,
              },
            },
          },
          success: {
            on: {
              RESET: { target: 'idle' },
            },
          },
          error: {
            on: {
              RETRY: {
                target: 'retrying',
                guard: retryGuard,
              },
              RESET: { target: 'idle' },
            },
          },
          retrying: {
            on: {
              SUCCESS: { target: 'success' },
              ERROR: { target: 'error' },
            },
          },
        },
      }

      const { result } = renderHook(() => useStateMachine(config))

      // Start fetch
      act(() => {
        result.current.send('FETCH')
      })
      expect(result.current.currentState).toBe('loading')
      expect(fetchStartAction).toHaveBeenCalled()

      // Simulate error
      act(() => {
        result.current.send('ERROR')
      })
      expect(result.current.currentState).toBe('error')
      expect(fetchErrorAction).toHaveBeenCalled()

      // Retry
      act(() => {
        result.current.send('RETRY')
      })
      expect(result.current.currentState).toBe('retrying')
      expect(retryGuard).toHaveBeenCalled()

      // Success on retry
      act(() => {
        result.current.send('SUCCESS')
      })
      expect(result.current.currentState).toBe('success')

      // Reset
      act(() => {
        result.current.send('RESET')
      })
      expect(result.current.currentState).toBe('idle')
    })
  })
})
