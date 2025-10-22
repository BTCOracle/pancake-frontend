import { Trans } from '@pancakeswap/localization'
import { Token } from '@pancakeswap/sdk'
import { ExpandableSectionButton, Flex, ScanLink, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/Logo'
import dayjs from 'dayjs'
import React from 'react'
import { styled } from 'styled-components'

const LiquidityDetailContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
`

const LiquidityDetailHeaderWrapper = styled.div`
  display: contents;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
`

const LiquidityDetailBodyWrapper = styled.div`
  display: contents;
  font-weight: bold;
  text-transform: uppercase;
`

const LiquidityDetailHeader = styled.div`
  padding: 10px 0;
  text-align: center;
  vertical-align: middle;
`

const LiquidityDetailCell = styled.div`
  padding: 10px 0;
  text-align: center;
`

const ExpandingWrapper = styled.div`
  padding: 24px;
  border-top: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`

interface LiquidityDetailsProps {
  extended: boolean
  onToggle: () => void
  token0: Token
  token1: Token
  actionsData: {
    timestamp: number
    action: string
    tokenTransferred: [number, number]
  }[]
}

function formatTokenTransferred(tokenTransferred: number) {
  return tokenTransferred > 0
    ? `+${tokenTransferred.toLocaleString('en-US', {
        maximumFractionDigits: 2,
      })}`
    : tokenTransferred.toLocaleString('en-US', {
        maximumFractionDigits: 2,
      })
}

export const LiquidityDetails: React.FC<LiquidityDetailsProps> = ({
  extended,
  onToggle,
  actionsData,
  token0,
  token1,
}) => {
  return (
    <ExpandingWrapper>
      <ExpandableSectionButton expanded={extended} onClick={onToggle} />
      {extended && (
        <LiquidityDetailContainer>
          <LiquidityDetailHeaderWrapper>
            <LiquidityDetailHeader>Action</LiquidityDetailHeader>
            <LiquidityDetailHeader />
            <LiquidityDetailHeader>Token Transferred</LiquidityDetailHeader>
          </LiquidityDetailHeaderWrapper>
          <LiquidityDetailBodyWrapper>
            {actionsData.map((d) => (
              <>
                <LiquidityDetailCell>
                  <Flex justifyContent="center" alignItems="center" style={{ gap: 5 }}>
                    {d.action}
                    <ScanLink
                      useBscCoinFallback
                      href="https://bscscan.com/txs?a=0xfeacb05b373f1a08e68235ba7fc92636b92ced01&ps=100&p=1"
                    >
                      <Trans>View on</Trans>
                    </ScanLink>
                  </Flex>
                  <Text color="secondary"> {dayjs(d.timestamp * 1000).format('ddd, DD, YYYY, HH:mm:ss')}</Text>
                </LiquidityDetailCell>
                <LiquidityDetailCell />
                <LiquidityDetailCell>
                  <Flex width="100%" flexDirection="column" justifyContent="center" alignItems="center">
                    <Flex justifyContent="center" alignItems="center" style={{ gap: 5 }}>
                      {formatTokenTransferred(d.tokenTransferred[0])}
                      <CurrencyLogo currency={token0} />
                      {token0.symbol}
                    </Flex>
                    <Flex justifyContent="center" alignItems="center" style={{ gap: 5 }}>
                      {formatTokenTransferred(d.tokenTransferred[1])}
                      <CurrencyLogo currency={token1} />
                      {token1.symbol}
                    </Flex>
                  </Flex>
                </LiquidityDetailCell>
              </>
            ))}
          </LiquidityDetailBodyWrapper>
        </LiquidityDetailContainer>
      )}
    </ExpandingWrapper>
  )
}
