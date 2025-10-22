import { Button, ButtonProps, FlexGap, WalletFilledV2Icon } from '@pancakeswap/uikit'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { logGTMConnectWalletEvent } from 'utils/customGTMEventTracking'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { walletModalVisibleAtom } from 'state/wallet/atom'
import Trans from './Trans'

interface ConnectWalletButtonProps extends ButtonProps {
  withIcon?: boolean
}

const ConnectWalletButton = ({ children, withIcon, ...props }: ConnectWalletButtonProps) => {
  const { chainId } = useActiveChainId()
  const [, setIsOpen] = useAtom(walletModalVisibleAtom)

  const handleConnectBtnClick = useCallback(() => {
    logGTMConnectWalletEvent(chainId)
    setIsOpen(true)
  }, [chainId, setIsOpen])

  return (
    <>
      <Button onClick={handleConnectBtnClick} {...props}>
        <FlexGap gap="8px" justifyContent="center" alignItems="center">
          {children || <Trans>Connect Wallet</Trans>} {withIcon && <WalletFilledV2Icon color="invertedContrast" />}
        </FlexGap>
      </Button>
      <style jsx global>{`
        w3m-modal {
          position: fixed;
          z-index: 100000000;
        }
      `}</style>
    </>
  )
}

export default ConnectWalletButton
