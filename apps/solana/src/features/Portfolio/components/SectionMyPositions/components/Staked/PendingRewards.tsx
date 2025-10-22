import { Flex, HStack, Text } from '@chakra-ui/react'

import { useTranslation } from '@pancakeswap/localization'
import Button from '@/components/Button'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'

type PendingRewardsProps = {
  pendingReward: string
  isLoading: boolean
  harvestable: boolean
  onHarvest: () => void
}

export default function PendingRewards({ pendingReward, isLoading, harvestable, onHarvest }: PendingRewardsProps) {
  const { t } = useTranslation()
  return (
    <Flex flexBasis="300px" minH="72px" bg={colors.backgroundDark} rounded="lg" justify="space-between" py={3} px={4}>
      <Flex direction="column" justify="space-between">
        <Text fontSize="sm" color={colors.textTertiary}>
          {t('Pending Rewards')}
        </Text>
        <HStack fontSize="sm" color={colors.textSecondary} fontWeight="500" spacing={1}>
          <Text>{formatCurrency(pendingReward, { symbol: '$', decimalPlaces: 6 })}</Text>
          <QuestionToolTip
            label={t('Pending rewards are calculated based on the current pool size and the time since the last harvest.')}
            iconType="info"
          />
        </HStack>
      </Flex>
      <Flex justify="flex-end" align="center">
        <Button variant="outline" isDisabled={!harvestable} isLoading={isLoading} onClick={onHarvest}>
          {t('Harvest')}
        </Button>
      </Flex>
    </Flex>
  )
}
