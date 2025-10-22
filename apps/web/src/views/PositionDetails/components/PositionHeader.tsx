import { Flex, Heading, Text } from '@pancakeswap/uikit'

interface LiquidityDetailHeaderProps {
  title: string
  token0Symbol: string
  token1Symbol: string
  chainName: string
  chainIcon: React.ReactNode
}

export const LiquidityHeader: React.FC<LiquidityDetailHeaderProps> = ({
  title,
  token0Symbol,
  token1Symbol,
  chainName,
  chainIcon,
}) => {
  return (
    <Flex style={{ gap: 16 }} justifyContent="flex-start" alignItems="center">
      <Heading>{title}</Heading>
      <Flex>
        <Text>{token0Symbol}</Text>
        <Text>/</Text>
        <Text>{token1Symbol}</Text>
      </Flex>
      <Flex justifyContent="center" alignItems="center">
        {chainName}
        {chainIcon}
      </Flex>
    </Flex>
  )
}
