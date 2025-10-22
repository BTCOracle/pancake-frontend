import { useMemo } from 'react'
import { BuyCryptoAtomProvider, createFormAtom } from 'state/buyCrypto/reducer'
import { EVM_CHAIN_IDS } from 'utils/wagmi'
import BuyCrypto from 'views/BuyCrypto'
import Page from 'views/Page'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Page showExternalLink={false} showHelpLink={false}>
      {children}
    </Page>
  )
}

const BuyCryptoPage = () => {
  const formAtom = useMemo(() => createFormAtom(), [])

  return (
    <BuyCryptoAtomProvider
      value={{
        formAtom,
      }}
    >
      <BuyCrypto />
    </BuyCryptoAtomProvider>
  )
}

BuyCryptoPage.chains = EVM_CHAIN_IDS
BuyCryptoPage.Layout = Layout

export default BuyCryptoPage
