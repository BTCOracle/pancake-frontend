import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js'
import { WalletContextState } from '@solana/wallet-adapter-react'

/**
 * Check if wallet is known to have issues with standard transaction sending
 */
function isProblematicWallet(walletName: string): boolean {
  const problematicWallets = ['SafePal', 'Trust Wallet', 'Trust']
  return problematicWallets.some((name) => walletName.toLowerCase().includes(name.toLowerCase()))
}

/**
 * Send transaction using wallet.sendTransaction method
 */
async function sendViaWalletAdapter(
  wallet: WalletContextState,
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
): Promise<string> {
  const signature = await wallet.sendTransaction(transaction, connection, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  // eslint-disable-next-line no-console
  console.log('✅ Transaction sent via sendTransaction:', signature)
  return signature
}

/**
 * Send transaction using manual sign and send (fallback method)
 */
async function sendViaSignAndRaw(
  wallet: WalletContextState,
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
): Promise<string> {
  if (!wallet.signTransaction) {
    throw new Error('Wallet does not support transaction signing')
  }

  // eslint-disable-next-line no-console
  console.log('⚠️ Using fallback: signTransaction + sendRawTransaction')

  const signed = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })

  // eslint-disable-next-line no-console
  console.log('✅ Transaction sent via fallback:', signature)
  return signature
}

/**
 * Safely send a transaction, handling both signAndSendTransaction and fallback methods
 */
export async function sendTransactionSafely(
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  wallet: WalletContextState,
): Promise<string> {
  const walletName = wallet.wallet?.adapter?.name || ''
  const isProblematic = isProblematicWallet(walletName)
  const supportsSignAndSend = typeof wallet.sendTransaction === 'function' && !isProblematic

  // eslint-disable-next-line no-console
  console.log('📤 Sending transaction:', {
    walletName,
    isProblematicWallet: isProblematic,
    supportsSignAndSend,
    transactionType: transaction instanceof VersionedTransaction ? 'VersionedTransaction' : 'Legacy Transaction',
  })

  try {
    // Try using sendTransaction (recommended method) - but not for problematic wallets
    if (supportsSignAndSend) {
      try {
        return await sendViaWalletAdapter(wallet, transaction, connection)
      } catch (sendError: any) {
        // If sendTransaction fails with "not support" error, fall through to manual sign
        if (sendError?.message?.includes('Not support') || sendError?.message?.includes('not support')) {
          // eslint-disable-next-line no-console
          console.log('⚠️ sendTransaction not supported, falling back to manual sign')
        } else {
          throw sendError
        }
      }
    }

    // Fallback: Manual sign and send
    return await sendViaSignAndRaw(wallet, transaction, connection)
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('❌ Transaction send error:', error)

    // Check for specific error types
    if (error?.message?.includes('signature verification')) {
      throw new Error('Transaction signature verification failed. Your wallet may not support this transaction type.')
    }

    throw error
  }
}
