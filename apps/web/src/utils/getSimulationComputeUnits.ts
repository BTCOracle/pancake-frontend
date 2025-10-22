import {
  AddressLookupTableAccount,
  Connection,
  Commitment,
  PublicKey,
  TransactionInstruction,
  VersionedTransaction,
  TransactionMessage,
  ComputeBudgetProgram,
} from '@solana/web3.js'

// Copy code from https://github.com/solana-developers/helpers/blob/main/src/lib/transaction.ts

/**
 * Check if a given instruction is a SetComputeUnitLimit instruction
 * See https://github.com/solana-program/compute-budget/blob/main/clients/js/src/generated/programs/computeBudget.ts#L29
 */
function isSetComputeLimitInstruction(ix: TransactionInstruction): boolean {
  return (
    ix.programId.equals(ComputeBudgetProgram.programId) && ix.data[0] === 2 // opcode for setComputeUnitLimit is 2
  )
}

export const getSimulationComputeUnits = async (
  connection: Connection,
  instructions: Array<TransactionInstruction>,
  payer: PublicKey,
  lookupTables: Array<AddressLookupTableAccount> | [],
  commitment: Commitment = 'confirmed',
): Promise<number | null> => {
  const simulationInstructions = [...instructions]

  // Replace or add compute limit instruction
  const computeLimitIndex = simulationInstructions.findIndex(isSetComputeLimitInstruction)
  const simulationLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_400_000,
  })

  if (computeLimitIndex >= 0) {
    simulationInstructions[computeLimitIndex] = simulationLimitIx
  } else {
    simulationInstructions.unshift(simulationLimitIx)
  }

  const testTransaction = new VersionedTransaction(
    new TransactionMessage({
      instructions: simulationInstructions,
      payerKey: payer,
      // RecentBlockhash can by any public key during simulation
      // since 'replaceRecentBlockhash' is set to 'true' below
      recentBlockhash: PublicKey.default.toString(),
    }).compileToV0Message(lookupTables),
  )

  const rpcResponse = await connection.simulateTransaction(testTransaction, {
    replaceRecentBlockhash: true,
    sigVerify: false,
    commitment,
  })

  if (rpcResponse?.value?.err) {
    const logs = rpcResponse.value.logs?.join('\n  • ') || 'No logs available'
    throw new Error(`Transaction simulation failed:\n  •${logs}${JSON.stringify(rpcResponse?.value?.err)}`)
  }

  const { unitsConsumed } = rpcResponse.value
  if (unitsConsumed === null || unitsConsumed === undefined) {
    return null
  }

  // Add 100% buffer to account for slight variations
  // Since compute units are not deterministic, we need to add a buffer to ensure the transaction is successful
  // Also, compute units are cheap on solana, so we can afford to add a buffer
  // 1_000_000 units is 0.001 SOL. For complex transaction, it is not easy to reach 1_000_000 units.
  return Math.ceil(unitsConsumed * 2)
}
