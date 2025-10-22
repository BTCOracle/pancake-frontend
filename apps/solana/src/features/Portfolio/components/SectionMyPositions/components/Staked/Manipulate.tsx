import { HStack } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'

import { useTranslation } from '@pancakeswap/localization'
import Button from '@/components/Button'
import MinusIcon from '@/icons/misc/MinusIcon'
import { colors } from '@/theme/cssVariables'
import { routeToPage } from '@/utils/routeTools'

type ActionButtonsProps = {
  id: string
  stakedToken: ApiV3Token | undefined
}

export default function ActionButtons({ id, stakedToken }: ActionButtonsProps) {
  const { t } = useTranslation()
  return (
    <HStack h="100%" justify="flex-end" align="center" gap={3}>
      <Button
        variant="outline"
        size="xs"
        w={9}
        h="30px"
        px={0}
        onClick={() => {
          routeToPage('staking', { queryProps: { dialog: 'unstake', open: id } })
        }}
      >
        <MinusIcon color={colors.secondary} />
      </Button>
      <Button
        size="sm"
        h="30px"
        w="130px"
        onClick={() => {
          routeToPage('staking', { queryProps: { dialog: 'stake', open: id } })
        }}
      >
        {t('Stake')} {stakedToken?.symbol}
      </Button>
    </HStack>
  )
}
