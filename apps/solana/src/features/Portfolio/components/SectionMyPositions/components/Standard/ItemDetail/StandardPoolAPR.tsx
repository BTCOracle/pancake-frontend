import { Flex, HStack, Text } from '@chakra-ui/react'

import { useTranslation } from '@pancakeswap/localization'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { colors } from '@/theme/cssVariables'
import toApr from '@/utils/numberish/toApr'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'

type MyPositionProps = {
  positionAPR: number | string
  center?: boolean
  isLocked?: boolean
}

export default function StandardPoolAPR({ positionAPR, center, isLocked = false }: MyPositionProps) {
  const { t } = useTranslation()
  return (
    <Flex direction="column" justify="space-between" py={1}>
      <Text textAlign={center ? 'center' : undefined} fontSize="sm" color={colors.textSecondary} mb={[2, '18px']}>
        {t('APR')}
      </Text>
      <HStack>
        <Text fontSize="lg" color={colors.textPrimary} lineHeight={1} fontWeight="medium">
          {formatToRawLocaleStr(toApr({ val: positionAPR, multiply: false }))}
        </Text>
        {!isLocked && (
          <QuestionToolTip
            iconProps={{
              width: 16,
              height: 16,
              fill: colors.textSecondary
            }}
            iconType="info"
            label={t('Estimated APR based on trading fees earned by the pool in the past 24H')}
          />
        )}
      </HStack>
    </Flex>
  )
}
