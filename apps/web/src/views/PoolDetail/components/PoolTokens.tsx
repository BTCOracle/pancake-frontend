import { AutoColumn, Flex, RowBetween, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useMemo } from 'react'
import { PoolInfo } from 'state/farmsV4/state/type'
import { formatAmount } from 'utils/formatInfoNumbers'
import { usePoolSymbol } from '../hooks/usePoolSymbol'
import { PoolTokensBar } from './PoolTokensBar'

const formatOptions = {
  displayThreshold: 0.001,
}

type PoolTokensProps = {
  poolInfo?: PoolInfo | null
}
export const PoolTokens: React.FC<PoolTokensProps> = ({ poolInfo }) => {
  const { symbol0, symbol1, currency0, currency1 } = usePoolSymbol()
  const [token0Tvl, token1Tvl] = useMemo(() => {
    if (!poolInfo?.tvlToken0 || !poolInfo?.tvlToken1) return [0, 0]
    return [
      formatAmount(Number(poolInfo.tvlToken0 ?? 0), formatOptions),
      formatAmount(Number(poolInfo.tvlToken1 ?? 0), formatOptions),
    ]
  }, [poolInfo?.tvlToken0, poolInfo?.tvlToken1])

  if (!poolInfo) {
    return null
  }

  return (
    <AutoColumn gap="12px">
      <RowBetween alignItems="center">
        <AutoColumn>
          <Flex>
            <CurrencyLogo currency={currency0} size="24px" />
            <Text fontSize={14} ml="8px" mt="1px" color="textSubtle">
              {symbol0}
            </Text>
          </Flex>
          <Text mt="4px" fontSize="18px">
            {token0Tvl}
          </Text>
        </AutoColumn>
        <AutoColumn>
          <Flex>
            <Text fontSize={14} mr="8px" mt="1px" color="textSubtle">
              {symbol1}
            </Text>
            <CurrencyLogo currency={currency1} size="24px" />
          </Flex>
          <Text mt="4px" fontSize="18px" textAlign="right">
            {token1Tvl}
          </Text>
        </AutoColumn>
      </RowBetween>
      <PoolTokensBar poolInfo={poolInfo} />
    </AutoColumn>
  )
}
