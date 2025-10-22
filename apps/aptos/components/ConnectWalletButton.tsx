import { Trans, useTranslation } from '@pancakeswap/localization'
import { LegacyWalletConfig, LegacyWalletModal, LegacyWalletModalProps } from '@pancakeswap/ui-wallets'
import { Button, type ButtonProps } from '@pancakeswap/uikit'
import { ConnectorNames, TOP_WALLET_MAP, wallets } from 'config/wallets'
import { useAuth } from 'hooks/useAuth'
import { useCallback, useState } from 'react'
import { logGTMWalletConnectEvent } from 'utils/customGTMEventTracking'

export const ConnectWalletButton = ({ children, ...props }: ButtonProps) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { login } = useAuth()

  const handleClick = () => {
    setOpen(true)
  }

  const handleLogin: LegacyWalletModalProps<ConnectorNames>['login'] = useCallback(
    async (wallet: LegacyWalletConfig<ConnectorNames>) => {
      return login(wallet.connectorId).then((res) => ({
        accounts: res?.account?.address ? [res.account?.address] : ([] as unknown as readonly [string, ...string[]]),
        chainId: res?.network,
      }))
    },
    [login],
  )

  return (
    <>
      <Button width="100%" onClick={handleClick} {...props}>
        {children || <Trans>Connect Wallet</Trans>}
      </Button>
      <LegacyWalletModal
        fullSize={false}
        mevDocLink={null}
        docText={t('Learn How to Create and Connect')}
        docLink="https://docs.pancakeswap.finance/get-started-aptos/wallet-guide"
        isOpen={open}
        topWallets={TOP_WALLET_MAP}
        wallets={wallets}
        login={handleLogin}
        onDismiss={() => setOpen(false)}
        onWalletConnectCallBack={logGTMWalletConnectEvent}
      />
    </>
  )
}
