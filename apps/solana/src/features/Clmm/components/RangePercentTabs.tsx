import { Button, HStack, Text } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'

import { colors } from '@/theme/cssVariables/colors'
import toPercentString from '@/utils/numberish/toPercentString'

const OPTIONS = [0.01, 0.05, 0.1, 0.2, 0.5]

interface Props {
  options?: number[]
  selected?: number
  onClick: (val: number) => void
}

export default ({ options, selected, onClick }: Props) => {
  const { t } = useTranslation()
  const displayOptions = options || OPTIONS

  return (
    <HStack flexWrap="wrap" spacing={[2, 2]} justifyContent={['space-between', 'flex-start']}>
      {displayOptions.map((val) => {
        const isSelected = selected === val
        return (
          <Button
            variant="primary60"
            size="xs"
            key={`tab-${val}`}
            px={['10px', '14px']}
            py="4px"
            height="28px"
            borderBottomWidth={isSelected ? '0' : '2px'}
            onClick={() => onClick(val)}
          >
            ± {toPercentString(val, { alreadyPercented: false })}
          </Button>
        )
      })}
      <Button onClick={() => onClick(0)} variant="unstyled" size="xs">
        <Text color={colors.primary60} fontWeight={600}>
          {t('Reset')}
        </Text>
      </Button>
    </HStack>
  )
}
