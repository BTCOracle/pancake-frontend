import {
  Connection,
  PublicKey,
  Transaction,
  TransactionMessage,
  TransactionInstruction,
  VersionedTransaction,
  SystemProgram,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  AddressLookupTableAccount,
} from '@solana/web3.js'
import {
  createTransferInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token'

export interface SolanaSendParams {
  connection: Connection
  fromPubkey: PublicKey
  toPubkey: PublicKey
  amount: number
  isNativeToken: boolean
  tokenMint?: PublicKey
  tokenDecimals?: number
  tokenProgramId?: PublicKey
  computeBudgetConfig: {
    units: number
    microLamports: number
  }
  walletSupportsV0?: boolean
}

/**
 * Creates token transfer instructions for SPL tokens
 */
async function createTokenTransferInstructions(
  connection: Connection,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  tokenMint: PublicKey,
  amount: number,
  tokenDecimals: number,
  tokenProgramId: PublicKey,
): Promise<TransactionInstruction[]> {
  const instructions: TransactionInstruction[] = []
  const amountInTokenUnits = Math.floor(amount * 10 ** tokenDecimals)

  // Get associated token accounts
  const senderTokenAccount = await getAssociatedTokenAddress(tokenMint, fromPubkey, false, tokenProgramId)
  const recipientTokenAccount = await getAssociatedTokenAddress(tokenMint, toPubkey, false, tokenProgramId)

  // Check if recipient's token account exists
  try {
    await getAccount(connection, recipientTokenAccount, 'confirmed', tokenProgramId)
  } catch (error: any) {
    if (error.name === 'TokenAccountNotFoundError') {
      // Create associated token account for recipient
      instructions.push(
        createAssociatedTokenAccountInstruction(
          fromPubkey, // payer
          recipientTokenAccount, // ata
          toPubkey, // owner
          tokenMint, // mint
          tokenProgramId,
        ),
      )
    } else {
      throw error
    }
  }

  // Add transfer instruction
  if (tokenProgramId.equals(TOKEN_2022_PROGRAM_ID)) {
    instructions.push(
      createTransferCheckedInstruction(
        senderTokenAccount,
        tokenMint,
        recipientTokenAccount,
        fromPubkey,
        amountInTokenUnits,
        tokenDecimals,
        [],
        tokenProgramId,
      ),
    )
  } else {
    instructions.push(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        fromPubkey,
        amountInTokenUnits,
        [],
        tokenProgramId,
      ),
    )
  }

  return instructions
}

/**
 * Creates a native SOL transfer instruction
 */
function createNativeTransferInstruction(
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amount: number,
): TransactionInstruction {
  const amountInLamports = Math.floor(amount * LAMPORTS_PER_SOL)
  return SystemProgram.transfer({
    fromPubkey,
    toPubkey,
    lamports: amountInLamports,
  })
}

/**
 * Builds the final transaction with the appropriate version
 */
export async function buildTransaction(
  instructions: TransactionInstruction[],
  connection: Connection,
  fromPubkey: PublicKey,
  walletSupportsV0: boolean,
  addressLookupTableAddresses?: AddressLookupTableAccount[],
): Promise<Transaction | VersionedTransaction> {
  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  // Create transaction based on wallet support
  if (walletSupportsV0) {
    // eslint-disable-next-line no-console
    console.log('🚀 Creating v0 transaction')
    // Create v0 transaction
    const messageV0 = new TransactionMessage({
      payerKey: fromPubkey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message(addressLookupTableAddresses)

    return new VersionedTransaction(messageV0)
  }

  // eslint-disable-next-line no-console
  console.log('📦 Creating legacy transaction')
  // Create legacy transaction
  const transaction = new Transaction()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = fromPubkey
  transaction.lastValidBlockHeight = lastValidBlockHeight
  instructions.forEach((ix) => transaction.add(ix))

  return transaction
}

/**
 * Creates a Solana transaction for sending assets
 * Automatically detects and uses the appropriate transaction version
 */
export async function createSolanaSendTransaction(
  params: SolanaSendParams,
): Promise<Transaction | VersionedTransaction> {
  const {
    connection,
    fromPubkey,
    toPubkey,
    amount,
    isNativeToken,
    tokenMint,
    tokenDecimals,
    tokenProgramId = TOKEN_PROGRAM_ID,
    computeBudgetConfig,
    walletSupportsV0 = false,
  } = params

  const instructions: TransactionInstruction[] = []

  // Add compute budget instructions
  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({ units: computeBudgetConfig.units }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: computeBudgetConfig.microLamports }),
  )

  if (isNativeToken) {
    // Native SOL transfer
    instructions.push(createNativeTransferInstruction(fromPubkey, toPubkey, amount))
  } else {
    // Token transfer
    if (!tokenMint || tokenDecimals === undefined) {
      throw new Error('Token mint and decimals are required for token transfers')
    }

    const tokenInstructions = await createTokenTransferInstructions(
      connection,
      fromPubkey,
      toPubkey,
      tokenMint,
      amount,
      tokenDecimals,
      tokenProgramId,
    )
    instructions.push(...tokenInstructions)
  }

  return buildTransaction(instructions, connection, fromPubkey, walletSupportsV0)
}

/**
 * Detects wallet transaction version support
 */
export function detectWalletTransactionSupport(wallet: any): boolean {
  const walletName = wallet?.adapter?.name || wallet?.name || ''

  // SafePal and Trust Wallet are known to have issues with v0 transactions
  // Force them to use legacy transactions
  const problematicWallets = ['SafePal', 'Trust Wallet', 'Trust']
  if (problematicWallets.some((name) => walletName.toLowerCase().includes(name.toLowerCase()))) {
    // eslint-disable-next-line no-console
    console.log('⚠️ Detected problematic wallet, forcing legacy transaction:', walletName)
    return false
  }

  // More strict check - only use v0 if explicitly supported
  const supportsV0 =
    wallet?.features?.['solana:signAndSendTransaction']?.supportedTransactionVersions?.has?.('v0') ||
    wallet?.features?.['solana:signTransaction']?.supportedTransactionVersions?.has?.('v0') ||
    wallet?.wallet?.adapter?.supportedTransactionVersions?.has?.(0)

  // eslint-disable-next-line no-console
  console.log('🔍 Wallet transaction support detection:', {
    walletName,
    supportsV0,
    supportedVersions: wallet?.adapter?.supportedTransactionVersions,
    features: wallet?.features,
  })

  return supportsV0 === true
}
