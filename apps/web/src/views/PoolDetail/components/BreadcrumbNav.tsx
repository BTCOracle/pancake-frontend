import { useTranslation } from '@pancakeswap/localization'
import { Breadcrumbs, Flex, Text } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import { usePoolSymbol } from '../hooks/usePoolSymbol'

export const BreadcrumbNav: React.FC = () => {
  const { t } = useTranslation()
  const { poolSymbol } = usePoolSymbol()

  if (!poolSymbol || poolSymbol === ' / ') return null

  return (
    <Flex justifyContent="space-between">
      <Breadcrumbs mb="32px">
        <NextLinkFromReactRouter to="/liquidity/pools">
          <Text color="primary60">{t('Farms')}</Text>
        </NextLinkFromReactRouter>
        <Flex>
          <Text mr="8px">{poolSymbol}</Text>
        </Flex>
      </Breadcrumbs>
    </Flex>
  )
}
