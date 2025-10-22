import { useTranslation } from '@pancakeswap/localization'
import { Box, CardBody, Flex, Spinner, Text } from '@pancakeswap/uikit'
import { LightCard } from '@pancakeswap/widgets-internal'

export const LoadingCard: React.FC = () => {
  const { t } = useTranslation()

  return (
    <LightCard padding="0" borderRadius="24px">
      <CardBody>
        <Flex justifyContent="center" alignItems="center" flexDirection="column" py="40px">
          <Box mb="16px">
            <Spinner />
          </Box>
          <Text fontSize="16px" color="textSubtle">
            {t('Loading...')}
          </Text>
        </Flex>
      </CardBody>
    </LightCard>
  )
}

export const EmptyPositionCard: React.FC = () => {
  const { t } = useTranslation()

  return (
    <LightCard padding="0" borderRadius="24px">
      <CardBody>
        <Flex justifyContent="center" alignItems="center" flexDirection="column" py="40px">
          <Text color="textSubtle">{t('No positions found')}</Text>
        </Flex>
      </CardBody>
    </LightCard>
  )
}
