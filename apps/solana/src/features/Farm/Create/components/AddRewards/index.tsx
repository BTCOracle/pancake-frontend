import { Flex, HStack, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import Button from '@/components/Button'
import PlusCircleIcon from '@/icons/misc/PlusCircleIcon'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { NewRewardInfo } from '../../type'
import AddRewardItem from './Reward'

export default function RewardAddItem(props: {
  maxRewardCount: number
  rewardInfos: NewRewardInfo[]
  onRewardInfoChange: (rewardInfo: Partial<NewRewardInfo>, index: number) => void
  onAddAnotherReward(): void
  onDeleteReward(index: number): void
  onClickBackButton?(): void
  onClickNextStepButton?(): void
}) {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()
  const hasError = props.rewardInfos.some((r) => !r.isValid) || props.rewardInfos.length === 0
  const existsTokens = props.rewardInfos.map((r) => r.token).join(',')
  const tokenFilterFn = useCallback(
    (token: ApiV3Token) => {
      const existsTokenSet = new Set(existsTokens.split(','))
      return !existsTokenSet.has(token.address)
    },
    [existsTokens]
  )

  return (
    <Flex direction="column" w="full" gap={4}>
      {props.rewardInfos.slice(0, props.maxRewardCount).map((rewardInfo, index) => (
        <AddRewardItem
          key={`${index}${rewardInfo.id}`}
          index={index}
          rewardInfo={rewardInfo}
          maxRewardCount={props.maxRewardCount}
          isDefaultOpen={index === 0}
          onDeleteReward={() => props.onDeleteReward(index)}
          onChange={(rewardInfo) => props.onRewardInfoChange(rewardInfo, index)}
          tokenFilterFn={tokenFilterFn}
        />
      ))}
      {isMobile && (
        <HStack align="center" onClick={props.onAddAnotherReward} cursor="pointer" pb={3}>
          <PlusCircleIcon width="14px" height="14px" />
          <Text color={colors.buttonPrimary} fontSize="sm" fontWeight="500">
            {t('Add another reward token')}
          </Text>
        </HStack>
      )}
      <Flex justify="space-between" align="center" gap={3}>
        <Button variant="outline" width="100%" onClick={props.onClickBackButton}>
          {t('Back')}
        </Button>
        <Button
          isDisabled={hasError}
          width="100%"
          borderBottom={!hasError ? '2px solid rgba(0, 0, 0, 0.2)' : 'none'}
          onClick={props.onClickNextStepButton}
        >
          {t('Next Step')}
        </Button>
      </Flex>
    </Flex>
  )
}
