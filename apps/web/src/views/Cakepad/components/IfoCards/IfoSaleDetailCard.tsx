import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, FlexGap, Text, CheckmarkCircleIcon, Box } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import useIfo from '../../hooks/useIfo'
import IfoPoolInfoDisplay from './IfoPoolInfoDisplay'

export const IfoSaleDetailCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { pools } = useIfo()

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
          {pools.map((pool) => (
            <FlexGap key={pool.pid} flexDirection="column" gap="8px">
              <Text fontSize="12px" bold color="secondary" lineHeight="1px" textTransform="uppercase">
                {pool.stakeCurrency?.symbol} {t('Pool')}
              </Text>
              <IfoPoolInfoDisplay pid={pool.pid} variant="presale" />
            </FlexGap>
          ))}
        </FlexGap>
      </CardBody>
    </Card>
  )
}

export default IfoSaleDetailCard
