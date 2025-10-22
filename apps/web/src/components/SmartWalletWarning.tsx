import { useTranslation } from '@pancakeswap/localization'
import { Box, Message, MessageText, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useIsSmartContract } from 'hooks/useIsSmartContract'
import { useAccount } from 'wagmi'

interface SmartWalletWarningProps {
  productName: string
}

const SmartWalletWarning: React.FC<SmartWalletWarningProps> = ({ productName }) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const isSmartWallet = useIsSmartContract(address)
  const { isMobile } = useMatchBreakpoints()

  if (!isSmartWallet) return null

  return (
    <Box
      width="100%"
      maxWidth="800px"
      style={{
        marginTop: isMobile ? '-20px' : '0px',
        padding: '10px',
      }}
      m="auto"
    >
      <Message variant="warning" m="16px 0">
        <MessageText>
          {t(
            'Smart contract wallets are currently not supported on %product%. To continue, please switch back to an EOA (Externally Owned Account) wallet before interacting with the product.',
            { product: productName },
          )}
        </MessageText>
      </Message>
    </Box>
  )
}

export default SmartWalletWarning
