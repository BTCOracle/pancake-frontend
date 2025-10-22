import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base'
import {
  BaseMessageSignerWalletAdapter,
  isVersionedTransaction,
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletDisconnectionError,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError
} from '@solana/wallet-adapter-base'
import type { Connection, SendOptions, Transaction, TransactionSignature, TransactionVersion, VersionedTransaction } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'

interface BackpackWalletEvents {
  connect(...args: unknown[]): unknown
  disconnect(...args: unknown[]): unknown
  accountChanged(newPublicKey: PublicKey): unknown
}

interface BackpackWalletSolanaAdapter extends EventEmitter<BackpackWalletEvents> {
  publicKey?: { toBytes(): Uint8Array }
  isConnected: boolean

  connect(): Promise<void>

  disconnect(): Promise<void>

  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>

  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>

  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>

  signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: TransactionSignature }>
}

interface BackpackWindow extends Window {
  backpack?: {
    solana?: BackpackWalletSolanaAdapter
  }
}

declare const window: BackpackWindow

export const BackpackWalletName = 'Backpack' as WalletName<'Backpack'>

export class BackpackWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = BackpackWalletName

  url = 'https://backpack.app/'

  icon = 'https://backpack.app/favicon.ico'

  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0])

  #connecting: boolean = false

  #wallet: BackpackWalletSolanaAdapter | null = null

  #publicKey: PublicKey | null = null

  #readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined' ? WalletReadyState.Unsupported : WalletReadyState.NotDetected

  constructor() {
    super()
    this.#connecting = false
    this.#wallet = null
    this.#publicKey = null

    if (this.#readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.backpack?.solana) {
          this.#readyState = WalletReadyState.Installed
          this.emit('readyStateChange', this.#readyState)
          return true
        }
        return false
      })
    }
  }

  get publicKey() {
    return this.#publicKey
  }

  get connecting() {
    return this.#connecting
  }

  get readyState() {
    return this.#readyState
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return
      if (this.readyState !== WalletReadyState.Installed) throw new WalletNotReadyError()

      this.#connecting = true

      const wallet = window.backpack?.solana

      if (wallet && !wallet.isConnected) {
        try {
          await wallet.connect()
        } catch (error: any) {
          throw new WalletConnectionError(error?.message, error)
        }
      }

      if (!wallet?.publicKey) throw new WalletAccountError()

      let publicKey: PublicKey
      try {
        publicKey = new PublicKey(wallet.publicKey.toBytes())
      } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error)
      }

      wallet.on('disconnect', this._disconnected)
      wallet.on('accountChanged', this._accountChanged)

      this.#wallet = wallet
      this.#publicKey = publicKey

      this.emit('connect', publicKey)
    } catch (error: any) {
      this.emit('error', error)
      throw error
    } finally {
      this.#connecting = false
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this.#wallet
    if (wallet) {
      wallet.off('disconnect', this._disconnected)
      wallet.off('accountChanged', this._accountChanged)

      this.#wallet = null
      this.#publicKey = null

      try {
        await wallet.disconnect()
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error))
      }
    }

    this.emit('disconnect')
  }

  async sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction_: T,
    connection: Connection,
    options: SendTransactionOptions = {}
  ): Promise<TransactionSignature> {
    try {
      const wallet = this.#wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        const { signers, ...sendOptions } = options
        let transaction = transaction_

        if (isVersionedTransaction(transaction)) {
          signers?.length && transaction.sign(signers)
        } else {
          transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T
          signers?.length && (transaction as Transaction).partialSign(...signers)
        }

        sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment

        const { signature } = await wallet.signAndSendTransaction(transaction, sendOptions)
        return signature
      } catch (error: any) {
        if (error instanceof WalletError) throw error
        throw new WalletSendTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    try {
      const wallet = this.#wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        return (await wallet.signTransaction(transaction)) || transaction
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    try {
      const wallet = this.#wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        return (await wallet.signAllTransactions(transactions)) || transactions
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this.#wallet
      if (!wallet) throw new WalletNotConnectedError()

      try {
        const { signature } = await wallet.signMessage(message)
        return signature
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error)
      }
    } catch (error: any) {
      this.emit('error', error)
      throw error
    }
  }

  private _disconnected = () => {
    const wallet = this.#wallet
    if (wallet) {
      wallet.off('disconnect', this._disconnected)
      wallet.off('accountChanged', this._accountChanged)

      this.#wallet = null
      this.#publicKey = null

      this.emit('error', new WalletDisconnectedError())
      this.emit('disconnect')
    }
  }

  private _accountChanged = (newPublicKey_: PublicKey) => {
    const publicKey = this.#publicKey
    if (!publicKey) return
    let newPublicKey = newPublicKey_

    try {
      newPublicKey = new PublicKey(newPublicKey.toBytes())
    } catch (error: any) {
      this.emit('error', new WalletPublicKeyError(error?.message, error))
      return
    }

    if (publicKey.equals(newPublicKey)) return

    this.#publicKey = newPublicKey
    this.emit('connect', newPublicKey)
  }
}
