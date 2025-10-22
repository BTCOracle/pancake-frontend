import { Box, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import TokenAvatar from '@/components/TokenAvatar'
import { colors } from '@/theme/cssVariables'
import { parseDateInfo } from '@/utils/date'
import { formatCurrency } from '@/utils/numberish/formatter'
import { NewRewardInfo } from '@/features/Farm/Create/type'
import { Desktop, Mobile } from '@/components/MobileDesktop'

type RewardReviewItemProps = {
  rewardInfo: NewRewardInfo
}

export default function RewardReviewItem({ rewardInfo }: RewardReviewItemProps) {
  const rewardToken = rewardInfo.token
  const startTimeInfo = parseDateInfo(rewardInfo.farmStart)
  const startT = rewardInfo.farmStart ? `${startTimeInfo.year}/${startTimeInfo.month}/${startTimeInfo.day}` : undefined

  const endTimeInfo = parseDateInfo(rewardInfo.farmEnd)
  const endT = rewardInfo.farmEnd ? `${endTimeInfo.year}/${endTimeInfo.month}/${endTimeInfo.day}` : undefined

  const duration =
    rewardInfo.farmEnd && rewardInfo.farmStart ? `${(rewardInfo.farmEnd - rewardInfo.farmStart) / (60 * 60 * 24 * 1000)}D` : undefined

  return (
    <>
      <Desktop>
        <SimpleGrid
          gridAutoFlow="column"
          gridTemplateColumns="1fr 1.3fr 2fr"
          gap={4}
          fontWeight={500}
          rounded="md"
          bg={colors.cardBg}
          border="1px solid"
          borderColor={colors.cardBorder01}
          borderRadius="20px"
          justifyContent="space-between"
          p={6}
        >
          <RewardItemHeadLabel rewardToken={rewardToken} />
          <AmountInfo rewardInfo={rewardInfo} />
          <DurationInfo startT={startT} endT={endT} duration={duration} />
        </SimpleGrid>
      </Desktop>
      <Mobile>
        <Box rounded="md" overflow="hidden" bg={colors.cardBg} border="1px solid" borderColor={colors.cardBorder01} borderRadius="20px">
          <SimpleGrid gridAutoFlow="column" gridTemplateColumns="1fr 2fr" gap={4} fontWeight={500} justifyContent="space-between" p={6}>
            <RewardItemHeadLabel rewardToken={rewardToken} />
            <AmountInfo rewardInfo={rewardInfo} />
          </SimpleGrid>
          <HStack p={6} justify="center">
            <DurationInfo startT={startT} endT={endT} duration={duration} />
          </HStack>
        </Box>
      </Mobile>
    </>
  )
}
function RewardItemHeadLabel(props: { rewardToken?: ApiV3Token }) {
  return (
    <HStack>
      <TokenAvatar token={props.rewardToken} />
      <Text fontSize="lg" fontWeight={600}>
        {props.rewardToken?.symbol}
      </Text>
    </HStack>
  )
}

function AmountInfo(props: { rewardInfo: NewRewardInfo }) {
  return (
    <Box>
      <Text fontSize="md" fontWeight={600}>
        {formatCurrency(props.rewardInfo.amount, { decimalPlaces: 2 })}
      </Text>
      <HStack fontSize="sm">
        <Text color={colors.textSubtle}>{formatCurrency(props.rewardInfo.perWeek, { decimalPlaces: 2 })}</Text>
        <Text color={colors.textSubtle}>/week</Text>
      </HStack>
    </Box>
  )
}

function DurationInfo(props: { startT?: string; endT?: string; duration?: string }) {
  return (
    <HStack spacing={4}>
      <Text>{props.startT}</Text>

      {/* divider */}
      <Box fontSize="sm" position="relative">
        <Text position="absolute" top={-2} left="50%" transform="translateX(-50%)" color={colors.textSubtle} whiteSpace="nowrap">
          {props.duration}
        </Text>
        <Box height="1.5px" width={12} bg={colors.textTertiary} my={4} />
      </Box>

      <HStack>
        <Text>{props.endT}</Text>
        <Text fontSize="sm" color={colors.textSubtle}>
          (UTC)
        </Text>
      </HStack>
    </HStack>
  )
}
