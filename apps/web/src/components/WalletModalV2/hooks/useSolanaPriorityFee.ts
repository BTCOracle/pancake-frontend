import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Priority Fee level definitions (based on Raydium)
export enum PriorityLevel {
  Fast = 0, // Medium fee (data.default.m)
  Turbo = 1, // High fee (data.default.h)
  Ultra = 2, // Very High fee (data.default.vh)
}

// Priority Fee mode definitions (based on Raydium)
export enum PriorityMode {
  MaxCap = 0, // Auto-optimize with cap limit
  Exact = 1, // Use exact specified fee
}

interface PriorityFeeConfig {
  [PriorityLevel.Fast]: number
  [PriorityLevel.Turbo]: number
  [PriorityLevel.Ultra]: number
}

interface PriorityFeeData {
  default: {
    h: number // High priority fee
    m: number // Medium priority fee
    vh: number // Very High priority fee
  }
}

// Use Raydium's Priority Fee API
const PRIORITY_FEE_API = 'https://api-v3.raydium.io/main/auto-fee'

// Storage keys
const PRIORITY_LEVEL_KEY = 'PANCAKESWAP_SOLANA_PRIORITY_LEVEL'
const PRIORITY_MODE_KEY = 'PANCAKESWAP_SOLANA_PRIORITY_MODE'
const TRANSACTION_FEE_KEY = 'PANCAKESWAP_SOLANA_TRANSACTION_FEE'

/**
 * Solana Priority Fee Management Hook
 * Fully based on Raydium's implementation
 */
export function useSolanaPriorityFee() {
  const [feeConfig, setFeeConfig] = useState<Partial<PriorityFeeConfig>>({})
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PRIORITY_LEVEL_KEY)
      return stored ? Number(stored) : PriorityLevel.Turbo
    }
    return PriorityLevel.Turbo
  })

  const [priorityMode, setPriorityMode] = useState<PriorityMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PRIORITY_MODE_KEY)
      return stored ? Number(stored) : PriorityMode.MaxCap
    }
    return PriorityMode.MaxCap
  })

  const [transactionFee, setTransactionFee] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TRANSACTION_FEE_KEY)
      return stored ? parseFloat(stored) : 0.001 // Default value 0.001 SOL
    }
    return 0.001
  })

  // Fetch dynamic Priority Fee configuration
  const fetchPriorityFee = useCallback(async () => {
    try {
      console.log('Fetching priority fee from Raydium API...')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(PRIORITY_FEE_API, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { data } = (await response.json()) as { data: PriorityFeeData }

      const newConfig: PriorityFeeConfig = {
        [PriorityLevel.Fast]: data.default.m / 10 ** 9, // Medium -> Fast
        [PriorityLevel.Turbo]: data.default.h / 10 ** 9, // High -> Turbo
        [PriorityLevel.Ultra]: data.default.vh / 10 ** 9, // Very High -> Ultra
      }

      setFeeConfig(newConfig)
      console.log('Priority fee config updated:', {
        fast: `${newConfig[PriorityLevel.Fast]} SOL`,
        turbo: `${newConfig[PriorityLevel.Turbo]} SOL`,
        ultra: `${newConfig[PriorityLevel.Ultra]} SOL`,
      })

      return newConfig
    } catch (error) {
      console.error('Failed to fetch priority fee:', error)

      // Use fallback values (based on historical data)
      const fallbackConfig: PriorityFeeConfig = {
        [PriorityLevel.Fast]: 0.000001, // 0.000001 SOL
        [PriorityLevel.Turbo]: 0.000005, // 0.000005 SOL
        [PriorityLevel.Ultra]: 0.00001, // 0.00001 SOL
      }

      setFeeConfig(fallbackConfig)
      console.log('Using fallback priority fee config:', fallbackConfig)
      return fallbackConfig
    }
  }, [])

  useQuery({
    queryKey: ['solanaPriorityFee'],
    queryFn: fetchPriorityFee,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: false,
    staleTime: 30000, // Data is fresh for 30 seconds
  })

  // Calculate current Priority Fee (fully based on Raydium logic)
  const getPriorityFee = useCallback((): number => {
    // Exact Fee mode: use user-specified exact fee
    if (priorityMode === PriorityMode.Exact) {
      return transactionFee
    }

    // Max Cap mode: take the smaller of user cap and system recommended fee
    const systemFee = feeConfig[priorityLevel]
    if (systemFee === undefined || !transactionFee) {
      return feeConfig[PriorityLevel.Turbo] ?? 0.000005
    }

    return Math.min(transactionFee, systemFee)
  }, [priorityMode, priorityLevel, transactionFee, feeConfig])

  // Convert to Compute Budget configuration (based on Raydium)
  const getComputeBudgetConfig = useCallback(() => {
    const currentFee = getPriorityFee()

    if (Number.isNaN(currentFee) || currentFee <= 0) {
      // Use default values
      return {
        units: 600000, // Fixed compute units
        microLamports: 1000, // Default 1000 micro-lamports
      }
    }

    // Convert SOL fee to microLamports
    // formula: (fee_in_sol * 10^9 * 10^6) / compute_units
    const microLamports = Math.ceil((currentFee * 1_000_000_000 * 1_000_000) / 600000)

    return {
      units: 600000,
      microLamports: Math.min(microLamports, 100000), // Set upper limit to prevent excessive fees
    }
  }, [getPriorityFee])

  // Update settings and save to localStorage
  const updatePriorityLevel = useCallback((level: PriorityLevel) => {
    setPriorityLevel(level)
    if (typeof window !== 'undefined') {
      localStorage.setItem(PRIORITY_LEVEL_KEY, String(level))
    }
  }, [])

  const updatePriorityMode = useCallback((mode: PriorityMode) => {
    setPriorityMode(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem(PRIORITY_MODE_KEY, String(mode))
    }
  }, [])

  const updateTransactionFee = useCallback((fee: number) => {
    setTransactionFee(fee)
    if (typeof window !== 'undefined') {
      localStorage.setItem(TRANSACTION_FEE_KEY, String(fee))
    }
  }, [])

  // Fee warning check
  const isFeeTooLow = useMemo(() => {
    const currentFee = getPriorityFee()
    const minRecommended = feeConfig[PriorityLevel.Fast] ?? 0.000001
    return currentFee < minRecommended
  }, [getPriorityFee, feeConfig])

  return {
    // Current state
    feeConfig,
    priorityLevel,
    priorityMode,
    transactionFee,

    // Calculated results
    currentFee: getPriorityFee(),
    computeBudgetConfig: getComputeBudgetConfig(),
    isFeeTooLow,

    // Update functions
    updatePriorityLevel,
    updatePriorityMode,
    updateTransactionFee,

    // API functions
    fetchPriorityFee,
  }
}
