import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, CheckmarkCircleIcon, FlexGap, Text } from '@pancakeswap/uikit'
import { CurrencyLogo, DoubleCurrencyLogo, NumberDisplay } from '@pancakeswap/widgets-internal'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'
import useIfo from 'views/Cakepad/hooks/useIfo'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { StyledLogo } from '../../Icons'

const SaleInfoWrapper = styled(FlexGap)`
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

const StyledText = styled(Text)`
  font-size: 14px;
  font-family: Kanit;
  line-height: 150%;
`

export const IfoPresetCardComing: React.FC = () => (
  <SaleInfoWrapper gap="16px">
    <IfoSaleInfoCard />
    <IfoSaleDetailCard />
  </SaleInfoWrapper>
)

const IfoSaleInfoCard = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { config } = useIfo()

  const { icon, presetData } = config ?? {}
  const { totalSalesAmount, offeringCurrency, stakeCurrency0, stakeCurrency1, preSaleDurationText } = presetData ?? {}

  return (
    <Card background={theme.colors.card} mb="16px">
      <CardBody>
        <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
          {t('Total Sale')}
        </Text>
        <FlexGap mt="8px" gap="8px" alignItems="center" background={theme.colors.backgroundAlt}>
          {icon && <StyledLogo size="40px" srcs={[icon]} />}
          <FlexGap flexDirection="column">
            <NumberDisplay
              bold
              fontSize="20px"
              lineHeight="30px"
              value={totalSalesAmount}
              suffix={` ${offeringCurrency?.symbol}`}
            />
            {preSaleDurationText && (
              <Text color="textSubtle">{`${t(preSaleDurationText.i18nText)} ${t('Event Duration')}`}</Text>
            )}
          </FlexGap>
        </FlexGap>
        <SubscribeInfo stakeCurrency0={stakeCurrency0} stakeCurrency1={stakeCurrency1} />
      </CardBody>
    </Card>
  )
}

interface SubscribeInfoProps {
  stakeCurrency0?: Currency
  stakeCurrency1?: Currency
}

const SubscribeInfo: React.FC<SubscribeInfoProps> = ({ stakeCurrency0, stakeCurrency1 }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  if (!stakeCurrency0 && !stakeCurrency1) {
    return null
  }
  return (
    <FlexGap
      alignItems="center"
      gap="8px"
      mt="16px"
      p="12px"
      borderRadius="16px"
      border={`1px solid ${theme.colors.cardBorder}`}
      background={theme.colors.cardSecondary}
    >
      {stakeCurrency0 && stakeCurrency1 ? (
        <DoubleCurrencyLogo size={40} currency0={stakeCurrency0} currency1={stakeCurrency1} />
      ) : stakeCurrency0 || stakeCurrency1 ? (
        <CurrencyLogo size="40px" currency={stakeCurrency0 ?? stakeCurrency1} />
      ) : null}
      <Text>
        {stakeCurrency0 && stakeCurrency1 ? (
          <>
            {t('Subscribe to the sale by depositing')}{' '}
            <Text as="span" bold>
              {stakeCurrency0.symbol} & {stakeCurrency1.symbol}
            </Text>{' '}
            {t('in a 1:1 ratio.')}
          </>
        ) : stakeCurrency0 || stakeCurrency1 ? (
          <>
            {t('Subscribe to the sale by depositing')}{' '}
            <Text as="span" bold>
              {stakeCurrency0?.symbol ?? stakeCurrency1?.symbol}
            </Text>
            .
          </>
        ) : null}
      </Text>
    </FlexGap>
  )
}

const IfoSaleDetailCard = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { config } = useIfo()

  const { pools } = config?.presetData ?? {}

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardBody>
        <FlexGap alignItems="flex-start" gap="8px">
          <Box mt="2px">
            <CheckmarkCircleIcon color={theme.colors.primary60} width="20px" />
          </Box>
          <Text color="primary60">{t('Eligible to join when this event goes live!')}</Text>
        </FlexGap>
        <FlexGap flexDirection="column" gap="16px" mt="22px">
          {pools &&
            pools.map((pool) => (
              <FlexGap key={pool.pid} flexDirection="column" gap="8px">
                <Text fontSize="12px" bold color="secondary" lineHeight="1px" textTransform="uppercase">
                  {pool.stakeCurrency?.symbol} {t('Pool')}
                </Text>
                <FlexGap justifyContent="space-between" mt="8px">
                  <StyledText color="textSubtle">{t('Sale Price per token')}</StyledText>
                  <StyledText color="text">{pool.pricePerToken}</StyledText>
                </FlexGap>
                <FlexGap justifyContent="space-between" mt="4px">
                  <StyledText color="textSubtle">{t('Raise Goal')}</StyledText>
                  <StyledText color="text">{pool.raiseAmountText}</StyledText>
                </FlexGap>
              </FlexGap>
            ))}
        </FlexGap>
      </CardBody>
    </Card>
  )
}
