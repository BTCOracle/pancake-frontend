import { WalletProvider as TronWalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks'

const EMPTY_ARRAY: never[] = []

export function BridgeWalletProvider(props: React.PropsWithChildren) {
  const { children } = props

  return (
    <TronWalletProvider adapters={EMPTY_ARRAY} autoConnect={false}>
      {children}
    </TronWalletProvider>
  )
}
