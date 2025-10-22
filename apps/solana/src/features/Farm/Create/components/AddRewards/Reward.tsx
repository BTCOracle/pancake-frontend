import { useRef } from 'react'
import { Box, Collapse, useDisclosure, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { useEvent } from '@/hooks/useEvent'
import { colors } from '@/theme/cssVariables'
import { useTokenAccountStore } from '@/store/useTokenAccountStore'

import { NewRewardInfo } from '../../type'
import RewardBody from './RewardBody'
import RewardHeader from './RewardHeader'
import useRewardSchema from '../useRewardSchema'

export type AddRewardItemProps = {
  isDefaultOpen?: boolean
  index: number
  rewardInfo: NewRewardInfo
  maxRewardCount?: number
  onChange: (rewardInfo: NewRewardInfo) => void
  onDeleteReward(): void
  tokenFilterFn: (token: ApiV3Token) => boolean
}

export default function AddRewardItem({
  isDefaultOpen,
  index,
  rewardInfo,
  maxRewardCount,
  tokenFilterFn,
  onChange,
  onDeleteReward
}: AddRewardItemProps) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isDefaultOpen })
  const domRef = useRef<HTMLDivElement>(null)
  const schema = useRewardSchema()
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const balance = getTokenBalanceUiAmount({ mint: rewardInfo.token?.address || '', decimals: rewardInfo.token?.decimals }).text

  const validateReward = useEvent((rewardInfo: NewRewardInfo) => {
    let error

    try {
      schema.validateSync({
        ...rewardInfo,
        balance
      })
    } catch (e: any) {
      error = e.message
    }
    return error
  })

  const onRewardEdit = useEvent((rewardInfo: NewRewardInfo) => {
    // TODO: Temporarily disable validation. Re-enable after integration of token balances

    // const error = validateReward(rewardInfo)
    // onChange({ ...rewardInfo, error, isValid: !error })

    onChange({ ...rewardInfo, error: undefined, isValid: true })
  })

  return (
    <Box
      ref={domRef}
      onClick={(ev) => {
        if (ev.target === domRef.current) onToggle()
      }}
      borderRadius="20px"
      bg={colors.cardBg}
      border="1px solid"
      borderColor={colors.cardBorder01}
      py={['18px', 7]}
      px={[4, 6]}
    >
      <RewardHeader
        onToggle={onToggle}
        onDeleteReward={onDeleteReward}
        index={index}
        isOpen={isOpen}
        token={rewardInfo.token}
        amount={rewardInfo.amount}
        perWeek={rewardInfo.perWeek}
      />
      <Collapse in={isOpen} animateOpacity>
        <RewardBody maxRewardCount={maxRewardCount} rewardInfo={rewardInfo} onChange={onRewardEdit} tokenFilterFn={tokenFilterFn} />
      </Collapse>
      <Text color="red" fontSize="sm" fontWeight={300} mt={4}>
        {rewardInfo.error}
      </Text>
    </Box>
  )
}
