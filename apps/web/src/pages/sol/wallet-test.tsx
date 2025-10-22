import { FlexGap } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Page from 'components/Layout/Page'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { CHAIN_IDS } from 'utils/wagmi'
import SolanaConnectButton from 'wallet/components/SolanaConnectButton'
import SolanaDisconnectButton from 'wallet/components/SolanaDisconnectButton'

export default function WalletTest() {
  const { chainId, account, solanaAccount, isWrongNetwork } = useAccountActiveChain()
  return (
    <Page>
      <p>activeChainId: {chainId}</p>
      <p>account: {account}</p>
      <p>solanaAccount: {solanaAccount}</p>
      <p>isWrongNetowork: {Boolean(isWrongNetwork)}</p>
      <FlexGap gap="16px">
        <ConnectWalletButton>Connect EVM Wallet</ConnectWalletButton>
        <SolanaConnectButton>Connect Solana</SolanaConnectButton>
        <SolanaDisconnectButton>Disconnect Solana</SolanaDisconnectButton>
      </FlexGap>
    </Page>
  )
}

WalletTest.chains = CHAIN_IDS
