import { Button, ButtonProps } from '@pancakeswap/uikit'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { LegacyRef, PropsWithChildren, forwardRef, useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { useAppStore } from '@/store'

type Props = PropsWithChildren<ButtonProps & { loadingText?: React.ReactNode }>

export default forwardRef(function ConnectedButton(
  { children, loadingText, onClick, disabled, ...props }: Props,
  ref: LegacyRef<HTMLButtonElement>
) {
  const { t } = useTranslation()
  const connected = useAppStore((s) => s.connected)
  const { setVisible } = useWalletModal()
  const handleClick = useCallback(() => setVisible(true), [setVisible])

  return (
    <Button
      variant="primary"
      ref={connected ? ref : undefined}
      {...props}
      disabled={connected ? disabled : false}
      onClick={connected ? onClick : handleClick}
    >
      {connected ? (props.isLoading && loadingText ? loadingText : children) : t('Connect Wallet')}
    </Button>
  )
})
