import { Box, Flex, HStack, Spacer, Text, VStack } from '@chakra-ui/react'
import { ApiV3PoolInfoItem, solToWSol } from '@pancakeswap/solana-core-sdk'

import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import Button from '@/components/Button'
import EditIcon from '@/icons/misc/EditIcon'
import { colors } from '@/theme/cssVariables'
import useTokenPrice from '@/hooks/token/useTokenPrice'

import PoolReviewItem from './PoolReviewItem'
import RewardReviewItem from './RewardReviewItem'
import { NewRewardInfo } from '../../type'
import { RewardTotalValue } from './RewardTotalValue'

export default function DetailReview(props: {
  rewardInfos: NewRewardInfo[]
  poolInfo: ApiV3PoolInfoItem | undefined
  isSending: boolean
  onClickBackButton(): void
  onClickCreateFarmButton(): void
  onJumpToStepSelect(): void
  onJumpToStepReward(): void
}) {
  const { t } = useTranslation()
  const { data: tokenPrices } = useTokenPrice({
    mintList: props.rewardInfos.map((r) => r.token?.address)
  })

  let total = new Decimal(0)

  props.rewardInfos.forEach((r) => {
    total = total.add(new Decimal(r.amount || 0).mul(tokenPrices[solToWSol(r.token?.address || '').toString() || '']?.value || 0))
  })

  return (
    <Box>
      <Flex direction="column" w="full" gap={6}>
        <Box>
          <HStack mb={2}>
            <Text color={colors.textSubtle} fontWeight={600} fontSize="lg">
              {t('Pool')}
            </Text>
            <Spacer />
            <Box cursor="pointer" onClick={props.onJumpToStepSelect}>
              <EditIcon />
            </Box>
          </HStack>
          {props.poolInfo && <PoolReviewItem poolInfo={props.poolInfo} />}
        </Box>

        <Box>
          <HStack mb={2}>
            <Text color={colors.textSubtle} fontWeight={600} fontSize="lg">
              {t('Farming rewards')}
            </Text>
            <Spacer />
            <Box cursor="pointer" onClick={props.onJumpToStepReward}>
              <EditIcon />
            </Box>
          </HStack>
          <VStack align="stretch" spacing={4}>
            {props.rewardInfos.map((reward) => (
              <RewardReviewItem key={reward.token?.address} rewardInfo={reward} />
            ))}
          </VStack>
          <RewardTotalValue total={total.toString()} />
        </Box>

        {/* alert text */}
        <Box fontSize="sm" fontWeight={500}>
          <Text color={colors.primary} display="inline" fontWeight={600}>
            {t('Please Note')}:{' '}
          </Text>
          <Text color={colors.textSubtle} display="inline">
            {t(
              'Rewards allocated to farms cannot be withdrawn after farming starts. Newly created farms generally appear on PancakeSwap 10-30 minutes after creation, depending on Solana network status.'
            )}
          </Text>
        </Box>

        <Flex justify="space-between" align="center" mt={7} gap={3}>
          <Button size={['lg', 'md']} variant="outline" width="100%" onClick={props.onClickBackButton}>
            {t('Back')}
          </Button>
          <Button
            size={['lg', 'md']}
            width="100%"
            isLoading={props.isSending}
            borderBottom={!props.isSending ? '2px solid rgba(0, 0, 0, 0.2)' : 'none'}
            onClick={props.onClickCreateFarmButton}
          >
            {t('Create Farm')}
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
