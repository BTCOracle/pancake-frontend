import { useTranslation } from '@pancakeswap/localization'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { Box, Flex, Grid, GridItem, HStack, Highlight, Text } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import TokenAvatar from '@/components/TokenAvatar'
import DeleteIcon from '@/icons/misc/DeleteIcon'
import EditIcon from '@/icons/misc/EditIcon'
import { colors } from '@/theme/cssVariables'

type RewardHeaderProps = {
  index: number
  isOpen: boolean
  onToggle: () => void
  token: ApiV3Token | undefined
  amount?: string
  perWeek?: string
  onDeleteReward(): void
}

export default function RewardHeader({ index, isOpen, onToggle, token, amount, perWeek, onDeleteReward }: RewardHeaderProps) {
  const { t } = useTranslation()

  return (
    <Box onClick={onToggle} cursor="pointer">
      <Flex justify="space-between" align="center">
        <Grid gridTemplate={`"index token week"`} gridTemplateColumns="auto 1fr auto" alignItems="center" gap={['10px', '30px']}>
          <GridItem gridArea="index">
            <Text fontWeight="600" color={colors.textSecondary} fontSize={['lg', 'xl']}>
              {t('Reward Token %index%', { index: index + 1 })}
            </Text>
          </GridItem>
          {!isOpen && (
            <>
              <GridItem gridArea="token" mr={3}>
                <HStack spacing={1}>
                  <TokenAvatar token={token} size="sm" />
                  <Text fontWeight="medium">{formatNumber(amount || 0, { maxDecimalDisplayDigits: 6 })}</Text>
                  <Text color={colors.textSecondary}>{token?.symbol}</Text>
                </HStack>
              </GridItem>
              <GridItem gridArea="week">
                <Text>
                  {perWeek ? (
                    <Highlight query="/week" styles={{ color: colors.textTertiary }}>
                      {`${formatNumber(perWeek, { maxDecimalDisplayDigits: 2 })}/week`}
                    </Highlight>
                  ) : null}
                </Text>
              </GridItem>
            </>
          )}
        </Grid>
        <Box onClick={isOpen ? onDeleteReward : onToggle} cursor="pointer">
          {isOpen ? <DeleteIcon fill={colors.textSubtle} /> : <EditIcon />}
        </Box>
      </Flex>
    </Box>
  )
}
