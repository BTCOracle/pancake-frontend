import { Box, Button, Flex, InjectedModalProps, ScanLink, Message, Skeleton, Text, AptosIcon } from '@pancakeswap/uikit'
import { useWallet } from '@solana/wallet-adapter-react'
import { useTranslation } from '@pancakeswap/localization'
import { useSolBalance } from '@/hooks/token/useSolBalance'
import { useAppStore } from '@/store'
import { WalletAddress } from './WalletAddress'

interface WalletInfoProps {
  onDismiss: InjectedModalProps['onDismiss']
}

const WalletInfo: React.FC<WalletInfoProps> = ({ onDismiss }) => {
  const { t } = useTranslation()
  const explorerUrl = useAppStore((s) => s.explorerUrl)
  const balance = useSolBalance()

  const { disconnect, connected, publicKey } = useWallet()

  const handleLogout = () => {
    onDismiss?.()
    disconnect()
  }

  return (
    <>
      <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px">
        {t('Your Address')}
      </Text>
      {connected && <WalletAddress tooltipMessage={t('Copied')} account={publicKey?.toBase58()} mb="24px" />}
      {/* {hasLowNativeBalance && (
        <Message variant="warning" mb="24px">
          <Box>
            <Text fontWeight="bold">
              {t('%currency% Balance Low', {
                currency: native.symbol,
              })}
            </Text>
            <Text as="p">
              {t('You need %currency% for transaction fees.', {
                currency: native.symbol,
              })}
            </Text>
          </Box>
        </Message>
      )} */}
      <Flex alignItems="center" justifyContent="space-between">
        <Flex>
          <Text color="textSubtle">SOL {t('Balance')}</Text>
        </Flex>
        <Text>{balance.text}</Text>
      </Flex>
      {connected && (
        <Flex alignItems="center" justifyContent="end" mb="24px">
          <ScanLink href={`${explorerUrl}/address/${publicKey?.toBase58()}`}>{t('View on explorer', { site: explorerUrl })}</ScanLink>
        </Flex>
      )}
      <Button variant="secondary" width="100%" onClick={handleLogout}>
        {t('Disconnect Wallet')}
      </Button>
    </>
  )
}

export default WalletInfo
