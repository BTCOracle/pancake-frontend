import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, FlexGap, Text } from '@pancakeswap/uikit'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { NumberDisplay } from '@pancakeswap/widgets-internal'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import useTheme from 'hooks/useTheme'
import { useMemo } from 'react'
import { StyledLogo } from 'views/Idos/components/Icons'
import { useCurrentIDOConfig } from 'views/Idos/hooks/ido/useCurrentIDOConfig'
import { useIDOConfig } from 'views/Idos/hooks/ido/useIDOConfig'
import { useIDOCurrencies } from 'views/Idos/hooks/ido/useIDOCurrencies'
import { useIDODuration } from 'views/Idos/hooks/ido/useIDODuration'

dayjs.extend(timezone)

export const IdoSaleInfoCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIDOCurrencies()
  const { totalSalesAmount, status, duration, startTimestamp, endTimestamp } = useIDOConfig()
  const { icon } = useCurrentIDOConfig() ?? {}
  const preSaleDurationText = useIDODuration(duration)

  const durationText = useMemo(() => {
    if (status !== 'finished') {
      return preSaleDurationText
    }

    const { days } = getTimePeriods(duration)
    if (days < 1) {
      return (
        <>
          {dayjs.unix(startTimestamp).format('DD-MM-YYYY')}
          <br />
          {dayjs.unix(startTimestamp).tz('Asia/Singapore').format('HH:mm')} -{' '}
          {dayjs.unix(endTimestamp).tz('Asia/Singapore').format('HH:mm')} (UTC+8)
        </>
      )
    }

    return (
      <>
        {dayjs.unix(startTimestamp).format('DD-MM-YYYY')} {t('to')} <br />
        {dayjs.unix(endTimestamp).format('DD-MM-YYYY')}
      </>
    )
  }, [duration, endTimestamp, preSaleDurationText, startTimestamp, status, t])

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardBody>
        <FlexGap gap="8px">
          {icon && <StyledLogo size="40px" srcs={[icon]} />}
          <FlexGap flexDirection="column">
            <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
              {t('Total Sale')}
            </Text>
            <NumberDisplay
              bold
              fontSize="20px"
              lineHeight="30px"
              value={totalSalesAmount?.toSignificant(6)}
              suffix={` ${offeringCurrency?.symbol}`}
            />
          </FlexGap>
        </FlexGap>
        <FlexGap flexDirection="column" gap="8px" mt="16px">
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle" style={{ whiteSpace: 'nowrap' }}>
              {t('Project Duration')}
            </Text>
            <Text textAlign="right">{durationText}</Text>
          </FlexGap>
        </FlexGap>
        {status !== 'finished' && (
          <Text color="textSubtle" mt="16px">
            {stakeCurrency0 && stakeCurrency1
              ? t('You can subscribe to the sale by depositing %stakeCurrency0% and %stakeCurrency1% half in ratio.', {
                  stakeCurrency0: stakeCurrency0.symbol,
                  stakeCurrency1: stakeCurrency1.symbol,
                })
              : stakeCurrency0 || stakeCurrency1
              ? t('You can subscribe to the sale by depositing %stakeCurrency%.', {
                  stakeCurrency: stakeCurrency0?.symbol ?? stakeCurrency1?.symbol,
                })
              : null}
          </Text>
        )}
      </CardBody>
    </Card>
  )
}
