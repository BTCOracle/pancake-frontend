import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, QuestionHelper, Tag, TagProps } from '@pancakeswap/uikit'
import { styleVariants } from '@pancakeswap/uikit/components/Tag/theme'
import { ReactNode } from 'react'

type IRangeTagType = {
  removed?: boolean
  outOfRange: boolean
  children?: ReactNode
  lowContrast?: boolean
  protocol?: Protocol
} & TagProps

export function RangeTag({ removed, outOfRange, protocol, children, lowContrast = false, ...props }: IRangeTagType) {
  const { t } = useTranslation()

  return removed ? (
    <Tag variant={lowContrast ? 'tertiary' : 'textSubtle'} {...props}>
      {children || t('Closed')}
    </Tag>
  ) : outOfRange ? (
    <Tag variant={lowContrast ? 'failureLowContrast' : 'failure'} {...props}>
      {children || (
        <Flex alignItems="center">
          {t('Inactive')}{' '}
          <QuestionHelper
            position="relative"
            top="1px"
            ml="4px"
            text={
              protocol === Protocol.InfinityBIN
                ? t('The position is inactive and not generating fees because there is no liquidity in the active bin.')
                : t(
                    'The position is inactive and not earning trading fees due to the current price being out of the set price range.',
                  )
            }
            size="20px"
            color={styleVariants[lowContrast ? 'failureLowContrast' : 'failure'].color ?? 'white'}
            placement="bottom"
          />
        </Flex>
      )}
    </Tag>
  ) : (
    <Tag variant={lowContrast ? 'successLowContrast' : 'success'} {...props}>
      {children || t('Active')}
    </Tag>
  )
}
