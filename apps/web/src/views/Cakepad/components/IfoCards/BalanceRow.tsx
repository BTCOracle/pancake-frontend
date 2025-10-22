import { useTranslation } from '@pancakeswap/localization'
import { Text, FlexGap, LazyAnimatePresence, domAnimation, Box } from '@pancakeswap/uikit'
import { CurrencyLogo, SwapUIV2 } from '@pancakeswap/widgets-internal'
import type { Currency } from '@pancakeswap/swap-sdk-core'
import { useAccount } from 'wagmi'

interface BalanceRowProps {
  currency?: Currency
  balance?: string
  isUserInsufficientBalance: boolean
  onMax: () => void
}

const BalanceRow: React.FC<BalanceRowProps> = ({ currency, balance, isUserInsufficientBalance, onMax }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()

  return (
    <FlexGap display="flex" justifyContent="space-between" alignItems="center" width="100%">
      {currency && (
        <FlexGap alignItems="center" gap="8px" justifyContent="center">
          <CurrencyLogo size="40px" currency={currency} />
          <Text fontSize="16px" fontWeight="600" lineHeight="24px">
            {currency.symbol}
          </Text>
        </FlexGap>
      )}

      <LazyAnimatePresence mode="wait" features={domAnimation}>
        {account ? (
          <SwapUIV2.WalletAssetDisplay
            style={{
              position: 'relative',
            }}
            label={t('Balance')}
            isUserInsufficientBalance={isUserInsufficientBalance}
            balance={balance}
            onMax={onMax}
          />
        ) : null}
      </LazyAnimatePresence>
    </FlexGap>
  )
}

export default BalanceRow
