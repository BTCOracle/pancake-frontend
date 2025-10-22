import { BackForwardIcon, Button, Flex, Text } from '@pancakeswap/uikit'
import { UnsafeCurrency } from 'config/constants/types'
import React from 'react'
import { styled } from 'styled-components'

const InfoBox = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 16px;
`
interface LiquidityAndFeeProps {
  token0: UnsafeCurrency
  token1: UnsafeCurrency
  minPrice: number
  maxPrice: number
  currentPrice: number
}

export const PriceRange: React.FC<LiquidityAndFeeProps> = ({ token0, token1, minPrice, maxPrice, currentPrice }) => {
  return (
    <Flex flexDirection="column" style={{ gap: 16 }}>
      <Flex justifyContent="space-between">
        <Text bold color="secondary" mb="8px" textTransform="uppercase">
          Price Range
        </Text>
        <Flex justifyContent="flex-end" alignItems="center" style={{ gap: 5 }}>
          <Text>view prices in</Text>
          <Button variant="secondary" scale="sm" startIcon={<BackForwardIcon />}>
            {token0?.symbol}
          </Button>
        </Flex>
      </Flex>
      <Flex style={{ gap: 32 }} alignItems="center" justifyContent="center">
        <Flex flexDirection="column" flexBasis="calc(50% - 32px)" style={{ gap: 8 }}>
          <InfoBox>
            <Text color="secondary" textTransform="uppercase" bold>
              Min Price
            </Text>
            <Text fontSize={20} bold>
              {minPrice}
            </Text>
            <Text color="textSubtle">
              {token0?.symbol} per {token1?.symbol}
            </Text>
          </InfoBox>
        </Flex>
        <Flex>
          <BackForwardIcon width={30} />
        </Flex>
        <Flex flexDirection="column" flexBasis="calc(50% - 32px)" style={{ gap: 8 }}>
          <InfoBox>
            <Text color="secondary" textTransform="uppercase" bold>
              Max Price
            </Text>
            <Text fontSize={20} bold>
              {maxPrice}
            </Text>
            <Text color="textSubtle">
              {token0?.symbol} per {token1?.symbol}
            </Text>
          </InfoBox>
        </Flex>
      </Flex>
      <InfoBox>
        <Text color="secondary" textTransform="uppercase" bold>
          Current Price
        </Text>
        <Text fontSize={20} bold>
          {currentPrice}
        </Text>
        <Text color="textSubtle">
          {token0?.symbol} per {token1?.symbol}
        </Text>
      </InfoBox>
    </Flex>
  )
}
