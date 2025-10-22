import { useTranslation } from '@pancakeswap/localization'
import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Box, Text } from '@pancakeswap/uikit'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { LottieComponentProps } from 'lottie-react'
import { useTheme } from 'styled-components'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import { NumberDisplay } from '@pancakeswap/widgets-internal'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { ifoLoadingAnimationAtom } from '../atoms'

const Lottie = dynamic<LottieComponentProps>(() => import('lottie-react'), { ssr: false })

interface IfoSubmittingCardProps {
  deposit: CurrencyAmount<Currency>
}

interface DepositDisplayProps {
  deposit: CurrencyAmount<Currency>
  usdValue: string
}

const DepositDisplay: React.FC<DepositDisplayProps> = ({ deposit, usdValue }) => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Box p="24px">
      <Box
        p="24px"
        style={{
          borderRadius: '24px',
          border: `1px solid ${theme.colors.cardBorder}`,
          background: theme.colors.background,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Text fontSize="14px" color="textSubtle">
          {t('Deposit Amount')}
        </Text>
        <Text>
          <NumberDisplay value={deposit.toExact()} suffix={` ${deposit.currency.symbol}`} />
        </Text>
        <Text fontSize="14px" color="textSubtle">
          ~{formatNumber(usdValue, { maxDecimalDisplayDigits: 6 })} USD
        </Text>
      </Box>
    </Box>
  )
}

const IfoSubmittingCard: React.FC<IfoSubmittingCardProps> = ({ deposit }) => {
  const animationData = useAtomValue(ifoLoadingAnimationAtom)

  const usdValue = useStablecoinPriceAmount(deposit.currency, Number(deposit.toExact()), {
    enabled: true,
  })

  const formattedUsd = useMemo(() => {
    try {
      return usdValue !== undefined && Number.isFinite(usdValue) ? usdValue.toFixed(2) : '0'
    } catch (error) {
      return '0'
    }
  }, [usdValue])

  return (
    <Box>
      <Box p="24px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {animationData && <Lottie animationData={animationData} loop style={{ width: 100 }} />}
      </Box>
      <DepositDisplay deposit={deposit} usdValue={formattedUsd} />
    </Box>
  )
}

export default IfoSubmittingCard
