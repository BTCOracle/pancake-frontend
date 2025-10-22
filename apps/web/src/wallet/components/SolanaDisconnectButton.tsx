import { Button, type ButtonProps } from '@pancakeswap/uikit'
import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback } from 'react'

const SolanaDisconnectButton: React.FC<ButtonProps> = (props) => {
  const { disconnect, connected } = useWallet()

  const handleClick = useCallback(() => {
    disconnect()
  }, [disconnect])

  return <Button onClick={handleClick} disabled={!connected} {...props} />
}

export default SolanaDisconnectButton
