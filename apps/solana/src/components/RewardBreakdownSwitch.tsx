import { useTranslation } from '@pancakeswap/localization'
import { useEffect } from 'react'
import { Box, Button, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { SwapHorizIcon } from '@pancakeswap/uikit'
import { colors } from '@/theme/cssVariables'
import { useAppStore } from '@/store'
import SquareDIcon from '@/icons/misc/SquareDIcon'
import Tooltip from './Tooltip'

export default function RewardBreakdownSwitch() {
  const { t } = useTranslation()
  const rewardBreakdownMode = useAppStore((s) => s.rewardBreakdownMode)
  const setRewardBreakdownModeAct = useAppStore((s) => s.setRewardBreakdownModeAct)
  const toggleRewardBreakdownMode = () => {
    setRewardBreakdownModeAct(rewardBreakdownMode === 'Aggr' ? 'Split' : 'Aggr')
  }

  useEffect(() => {
    setRewardBreakdownModeAct(rewardBreakdownMode)
  }, [rewardBreakdownMode])

  const text = {
    Split: {
      title: t('Split Display'),
      description: t('Display rewards in a split view. Click this icon to switch to the Aggregate view.')
    },
    Aggr: {
      title: t('Aggregated Display'),
      description: t('Display rewards in an aggregate view. Click this icon to switch to the Split view.')
    }
  } as const

  return (
    <>
      <Tooltip
        label={(handlers) => (
          <SimpleGrid gridTemplateColumns="auto auto" alignItems="center" rowGap={2}>
            <Text fontSize="sm">{text[rewardBreakdownMode].title}</Text>
            <Button variant="ghost" size="sm" justifySelf="end" width="fit-content" onClick={toggleRewardBreakdownMode}>
              <HStack color={colors.primary60}>
                <SwapHorizIcon color={colors.primary60} />
                <Text>{t('Switch')}</Text>
              </HStack>
            </Button>
            <Box gridColumn="span 2">
              <Text fontSize="xs">{text[rewardBreakdownMode].description}</Text>
            </Box>
          </SimpleGrid>
        )}
      >
        <Box onClick={toggleRewardBreakdownMode}>
          <SwapHorizIcon color={colors.primary60} />
        </Box>
      </Tooltip>
    </>
  )
}
