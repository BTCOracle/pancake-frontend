/**
 * New Solana transaction fee estimation system
 * Based on Raydium's dynamic Priority Fee architecture
 *
 * This file replaces the previous complex estimation logic
 * Now uses dynamically fetched Priority Fee + base transaction fees
 */
import { Connection, PublicKey } from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
  TokenAccountNotFoundError,
  ACCOUNT_SIZE,
} from '@solana/spl-token'
import { formatUnits } from 'viem'

interface SimpleFeeEstimationParams {
  connection: Connection
  solanaPublicKey: PublicKey
  recipientAddress: string
  isNativeToken: boolean
  tokenInfo?: {
    address: string
    decimals: number
  }
  priorityFeeLamports: number // Priority Fee from useSolanaPriorityFee (in lamports)
}

interface SimpleFeeBreakdown {
  baseFee: bigint
  priorityFee: bigint
  ataRent: bigint
  totalFee: bigint
  formattedFee: string
}

/**
 * Detect which token program is used for a given token mint
 */
async function detectTokenProgram(connection: Connection, tokenMintAddress: PublicKey): Promise<PublicKey> {
  try {
    const mintInfo = await connection.getAccountInfo(tokenMintAddress)
    if (mintInfo?.owner.equals(TOKEN_2022_PROGRAM_ID)) {
      return TOKEN_2022_PROGRAM_ID
    }
  } catch (error) {
    console.log('Failed to detect token program, using default TOKEN_PROGRAM_ID')
  }
  return TOKEN_PROGRAM_ID
}

/**
 * Check if recipient needs Associated Token Account creation and calculate rent
 */
async function calculateATARent(
  connection: Connection,
  tokenMintAddress: PublicKey,
  recipientPubkey: PublicKey,
  tokenProgramId: PublicKey,
): Promise<bigint> {
  try {
    const recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMintAddress,
      recipientPubkey,
      false,
      tokenProgramId,
    )

    try {
      await getAccount(connection, recipientTokenAccount, 'confirmed', tokenProgramId)
      console.log('Recipient ATA exists, no creation needed')
      return 0n
    } catch (error: any) {
      if (error instanceof TokenAccountNotFoundError) {
        console.log('Recipient ATA does not exist, will need creation')
        // Get actual ATA creation fee
        const ataRent = BigInt(await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE))
        console.log('ATA creation fee:', formatUnits(ataRent, 9), 'SOL')
        return ataRent
      }
      throw error
    }
  } catch (error) {
    console.error('Error checking ATA requirements:', error)
    // Use default ATA creation fee
    return BigInt(2039280) // About 0.002 SOL
  }
}

/**
 * Calculate total fee breakdown from components
 */
function calculateFeeBreakdown(baseFee: bigint, priorityFee: bigint, ataRent: bigint): SimpleFeeBreakdown {
  const totalFee = baseFee + priorityFee + ataRent
  const formattedFee = formatUnits(totalFee, 9) // SOL has 9 decimals

  console.log('📊 Simplified Solana Fee Breakdown:', {
    baseFee: `${formatUnits(baseFee, 9)} SOL`,
    priorityFee: `${formatUnits(priorityFee, 9)} SOL (from dynamic API)`,
    ataRent: ataRent > 0n ? `${formatUnits(ataRent, 9)} SOL` : '0 SOL (no ATA needed)',
    totalFee: `${formattedFee} SOL`,
  })

  return {
    baseFee,
    priorityFee,
    ataRent,
    totalFee,
    formattedFee,
  }
}

/**
 * Simplified Solana fee estimation
 * No longer does complex simulation, directly uses dynamic Priority Fee + base fees
 */
export async function estimateSimpleSolanaFee({
  connection,
  solanaPublicKey,
  recipientAddress,
  isNativeToken,
  tokenInfo,
  priorityFeeLamports,
}: SimpleFeeEstimationParams): Promise<SimpleFeeBreakdown> {
  const recipientPubkey = new PublicKey(recipientAddress)

  const baseFee = 5000n // Base signature fee (fixed)
  const priorityFee = BigInt(priorityFeeLamports)
  let ataRent = 0n

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _solanaPublicKey = solanaPublicKey // Keep as parameter but unused

  // Only check if ATA creation is needed
  if (!isNativeToken && tokenInfo) {
    const tokenMintAddress = new PublicKey(tokenInfo.address)
    const tokenProgramId = await detectTokenProgram(connection, tokenMintAddress)
    ataRent = await calculateATARent(connection, tokenMintAddress, recipientPubkey, tokenProgramId)
  }

  return calculateFeeBreakdown(baseFee, priorityFee, ataRent)
}

/**
 * Quick estimation (when detailed estimation is unavailable)
 */
export function getQuickSolanaFeeEstimate(priorityFeeLamports: number, needsATA: boolean = false): string {
  let totalFee = 5000 // Base fee
  totalFee += priorityFeeLamports // Priority fee

  if (needsATA) {
    totalFee += 2039280 // Default ATA creation fee
  }

  return formatUnits(BigInt(totalFee), 9)
}
