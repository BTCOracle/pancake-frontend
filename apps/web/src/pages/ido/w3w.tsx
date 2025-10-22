import { Button, Container, FlexGap } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Page from 'components/Layout/Page'
import { useState } from 'react'
import { useW3WAccountSign } from 'views/Idos/hooks/w3w/useW3WAccountSign'
import { useW3WAccountVerify } from 'views/Idos/hooks/w3w/useW3WAccountVerify'
import { useAccount } from 'wagmi'

export default function W3W() {
  const { address } = useAccount()
  const { verifyStatus, verifyCode } = useW3WAccountVerify()
  const sign = useW3WAccountSign()
  const [signature, setSignature] = useState<object | null>(null)

  const handleSign = async () => {
    const s = await sign()
    console.info('s', s)
    setSignature(s)
  }

  return (
    <Page>
      <Container>
        {address ? (
          <FlexGap flexDirection="column" gap="16px">
            <pre>
              address: {address}
              <br />
              isVerified: {verifyStatus}
              <br />
              verifyCode: {verifyCode}
            </pre>
            <Button onClick={handleSign}>Sign</Button>
            <pre>{signature ? JSON.stringify(signature, null, 2) : 'No signature'}</pre>
          </FlexGap>
        ) : (
          <ConnectWalletButton />
        )}
      </Container>
    </Page>
  )
}
