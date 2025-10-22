import { useTranslation } from '@pancakeswap/localization'
import { UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { AutoColumn, Button } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { CommitButton } from 'components/CommitButton'
import { ReactNode } from 'react'
import { CurrencyField as Field } from 'utils/types'

export interface SolanaSubmitButtonProps {
  addIsUnsupported: boolean
  addIsWarning: boolean
  account?: string
  isWrongNetwork: boolean
  isValid: boolean
  parsedAmounts: {
    CURRENCY_A?: UnifiedCurrencyAmount<UnifiedCurrency>
    CURRENCY_B?: UnifiedCurrencyAmount<UnifiedCurrency>
  }
  onClick: () => void | Promise<void>
  attemptingTxn: boolean
  errorMessage: ReactNode
  buttonText: string
  endIcon?: ReactNode
  depositADisabled: boolean
  depositBDisabled: boolean
}

export function SolanaSubmitButton({
  addIsUnsupported,
  addIsWarning,
  account,
  isWrongNetwork,
  isValid,
  parsedAmounts,
  onClick,
  attemptingTxn,
  errorMessage,
  buttonText,
  endIcon,
}: SolanaSubmitButtonProps) {
  const { t } = useTranslation()

  if (addIsUnsupported || addIsWarning) {
    return (
      <Button disabled mb="4px">
        {t('Unsupported Asset')}
      </Button>
    )
  }
  if (!account) {
    return <ConnectWalletButton width="100%" />
  }
  if (isWrongNetwork) {
    return <CommitButton />
  }

  const variant =
    !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B] ? 'danger' : 'primary'

  return (
    <AutoColumn gap="md">
      <CommitButton endIcon={endIcon} variant={variant as any} onClick={onClick} disabled={!isValid || attemptingTxn}>
        {errorMessage || buttonText}
      </CommitButton>
    </AutoColumn>
  )
}
