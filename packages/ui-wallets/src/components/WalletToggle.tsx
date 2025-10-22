import { FlexGap, Text, Toggle, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useWalletFilter } from '../state/hooks'

export type WalletModalFilterProps = {
  solanaAddress?: string
  evmAddress?: string
}

export const WalletToggle: React.FC<WalletModalFilterProps> = ({ solanaAddress, evmAddress }) => {
  const displayFilterToggle = Boolean(solanaAddress) || Boolean(evmAddress)
  const disableFilterToggle = Boolean(solanaAddress) !== Boolean(evmAddress)

  const { t } = useTranslation()
  const { type: walletFilter, value: walletFilterChecked, setFilterValue } = useWalletFilter()
  const { isMobile } = useMatchBreakpoints()

  if (!displayFilterToggle) return null

  return (
    <FlexGap
      gap="8px"
      alignItems="center"
      as="label"
      htmlFor="wallet-modal-network-toggle"
      style={{
        opacity: disableFilterToggle ? '0.5' : 1,
        cursor: disableFilterToggle ? 'not-allowed' : 'pointer',
      }}
    >
      <Text textTransform="uppercase" fontWeight="600" color="textSubtle" fontSize="12px">
        {walletFilter === 'solanaOnly' ? 'Solana' : 'EVM'} {t('Only')}
      </Text>
      <Toggle
        checked={walletFilterChecked}
        scale={isMobile ? 'sm' : 'md'}
        defaultColor={disableFilterToggle ? 'success' : 'input'}
        id="wallet-modal-network-toggle"
        disabled={disableFilterToggle}
        onChange={() => setFilterValue(!walletFilterChecked)}
      />
    </FlexGap>
  )
}
