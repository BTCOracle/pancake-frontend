import { Button, Flex, Text, Toggle } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/Logo'
import { UnsafeCurrency } from 'config/constants/types'
import React from 'react'
import { styled } from 'styled-components'

const InfoBox = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
`
interface LiquidityAndFeeProps {
  token0: UnsafeCurrency
  token1: UnsafeCurrency
  liquidityUsd: number
  unClaimedFeesUsd: number
  onClaimFee?: () => void
}

export const LiquidityAndFee: React.FC<LiquidityAndFeeProps> = ({
  token0,
  token1,
  liquidityUsd,
  unClaimedFeesUsd,
  onClaimFee,
}) => {
  return (
    <Flex flexDirection="column">
      <Flex style={{ gap: 32 }}>
        <Flex flexDirection="column" flexBasis="calc(50% - 16px)" style={{ gap: 8 }}>
          <Text bold color="secondary">
            Liquidity
          </Text>
          <Flex>
            <Text bold lineHeight="150%" fontSize={24}>
              ${liquidityUsd}
            </Text>
          </Flex>
          <InfoBox>
            <Flex justifyContent="space-between">
              <Flex style={{ gap: 5 }}>
                {token0 && <CurrencyLogo currency={token0} size="24px" />}
                <Text color="textSubtle">{token0?.symbol}</Text>
              </Flex>
              <Text>0.222333</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Flex style={{ gap: 5 }}>
                {token1 && <CurrencyLogo currency={token1} size="24px" />}
                <Text color="textSubtle">{token1?.symbol}</Text>
              </Flex>
              <Text>0.222333</Text>
            </Flex>
          </InfoBox>
        </Flex>
        <Flex flexDirection="column" flexBasis="calc(50% - 16px)" style={{ gap: 8 }}>
          <Text bold color="secondary">
            Unclaimed fees
          </Text>
          <Flex justifyContent="space-between" alignItems="center">
            <Text bold lineHeight="150%" fontSize={24}>
              ${unClaimedFeesUsd}
            </Text>
            <Button scale="sm" variant="secondary" onClick={onClaimFee}>
              Collect
            </Button>
          </Flex>
          <InfoBox>
            <Flex justifyContent="space-between">
              <Flex style={{ gap: 5 }}>
                {token0 && <CurrencyLogo currency={token0} size="24px" />}
                <Text color="textSubtle">{token0?.symbol}</Text>
              </Flex>
              <Text>0.222333</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Flex style={{ gap: 5 }}>
                {token1 && <CurrencyLogo currency={token1} size="24px" />}
                <Text color="textSubtle">{token1?.symbol}</Text>
              </Flex>
              <Text>0.222333</Text>
            </Flex>
          </InfoBox>
        </Flex>
      </Flex>
      <Flex style={{ gap: 6 }} mt="10px" justifyContent="end" alignItems="center">
        Collect as WBNB
        <Toggle scale="sm" />
      </Flex>
    </Flex>
  )
}
