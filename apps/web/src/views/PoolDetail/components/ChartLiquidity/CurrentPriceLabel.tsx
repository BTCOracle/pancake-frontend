import { useTranslation } from '@pancakeswap/localization'
import { Flex, Text } from '@pancakeswap/uikit'
import { PoolInfo } from 'state/farmsV4/state/type'
import { styled } from 'styled-components'
import { LiquidityChartData } from './type'

const Wrapper = styled.div`
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  width: fit-content;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
`

const PriceDot = styled.div`
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.secondary};
  margin-right: 6px;
`

interface CurrentPriceLabelProps {
  data: LiquidityChartData[] | undefined
  poolInfo?: PoolInfo | null
}

export const CurrentPriceLabel: React.FC<CurrentPriceLabelProps> = ({ data, poolInfo }) => {
  const { t } = useTranslation()

  const currentPriceData = data?.find((entry) => entry.isCurrent)

  if (!currentPriceData || !poolInfo) {
    return null
  }

  const { price0 } = currentPriceData

  return (
    <Wrapper>
      <Flex alignItems="center" mb="4px">
        <PriceDot />
        <Text small bold>
          {t('Current Price')}
        </Text>
      </Flex>
      <Text>
        {Number(price0).toLocaleString(undefined, {
          minimumSignificantDigits: 1,
          maximumSignificantDigits: 5,
        })}{' '}
        {poolInfo.token1.symbol} per {poolInfo.token0.symbol}
      </Text>
    </Wrapper>
  )
}
