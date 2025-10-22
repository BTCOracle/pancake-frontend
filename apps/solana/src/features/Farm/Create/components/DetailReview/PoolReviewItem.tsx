import { Box, HStack, Text } from '@chakra-ui/react'
import { ApiV3PoolInfoItem } from '@pancakeswap/solana-core-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { getPoolName } from '@/features/Pools/util'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'

type PoolReviewItemProps = {
  poolInfo: ApiV3PoolInfoItem
}

export default function PoolReviewItem({ poolInfo }: PoolReviewItemProps) {
  return (
    <>
      <Desktop>
        <HStack
          fontWeight={500}
          rounded="md"
          bg={colors.cardBg}
          border="1px solid"
          borderColor={colors.cardBorder01}
          borderRadius="20px"
          justify="space-between"
          p={6}
        >
          <RewardPoolItemHeadLabel poolInfo={poolInfo} />
          <RewardPoolItemTVLInfoBox tvl={poolInfo.tvl} />
          <RewardPoolItemAPRInfoBox apr={poolInfo.day.apr} />
        </HStack>
      </Desktop>
      <Mobile>
        <Box rounded="md" overflow="hidden" bg={colors.cardBg} border="1px solid" borderColor={colors.cardBorder01} borderRadius="20px">
          <HStack gap={4} fontWeight={500} p={6}>
            <RewardPoolItemHeadLabel poolInfo={poolInfo} />
          </HStack>
          <HStack pb={6} justify="space-around">
            <RewardPoolItemTVLInfoBox tvl={poolInfo.tvl} />
            <RewardPoolItemAPRInfoBox apr={poolInfo.day.apr} />
          </HStack>
        </Box>
      </Mobile>
    </>
  )
}

function RewardPoolItemHeadLabel(props: { poolInfo: ApiV3PoolInfoItem }) {
  const { t } = useTranslation()
  return (
    <HStack>
      <TokenAvatarPair token1={props.poolInfo.mintA} token2={props.poolInfo.mintB} />
      <Text fontSize="lg" fontWeight={600}>
        {getPoolName(props.poolInfo)}
      </Text>
      <QuestionToolTip label={t('🤖')} iconProps={{ color: colors.textTertiary }} />
    </HStack>
  )
}

function RewardPoolItemTVLInfoBox(props: { tvl: number }) {
  return (
    <Box>
      <Text fontSize="xs" color={colors.textSubtle}>
        TVL
      </Text>
      <Text fontWeight={600}>{formatCurrency(props.tvl, { symbol: '$', decimalPlaces: 2 })}</Text>
    </Box>
  )
}

function RewardPoolItemAPRInfoBox(props: { apr: number }) {
  return (
    <Box>
      <Text fontSize="xs" color={colors.textSubtle}>
        APR
      </Text>
      <Text fontWeight={600}>
        {formatToRawLocaleStr(
          toPercentString(props.apr, {
            alreadyPercented: true
          })
        )}
      </Text>
    </Box>
  )
}
