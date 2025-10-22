import { Balance, Box, Flex, Skeleton, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { Pool } from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'

import { Token } from '@pancakeswap/sdk'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'

interface StakedCellProps {
  pool: Pool.DeserializedPool<Token>
  account: string
}

const StakedCell: React.FC<React.PropsWithChildren<StakedCellProps>> = ({ pool, account }) => {
  const { isMobile } = useMatchBreakpoints()

  // pool
  const { stakingTokenPrice = 0, stakingToken, userData } = pool
  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const stakedTokenBalance = getBalanceNumber(stakedBalance, stakingToken.decimals)
  const stakedTokenDollarBalance = getBalanceNumber(
    stakedBalance.multipliedBy(stakingTokenPrice),
    stakingToken.decimals,
  )

  const labelText = `${pool.stakingToken.symbol} t('Staked')}`

  const hasStaked = account && stakedBalance.gt(0)

  const userDataLoading = !pool.userDataLoaded

  return (
    <Pool.BaseCell role="cell" flex={['1 0 50px', '1 0 50px', '2 0 100px', '2 0 100px', '1 0 120px']}>
      <Pool.CellContent>
        <Text fontSize="12px" color="textSubtle" textAlign="left" verticalAlign="center">
          {labelText}
        </Text>
        {userDataLoading && account ? (
          <Skeleton width="80px" height="16px" />
        ) : (
          <>
            <Flex>
              <Box mr="8px" height="32px">
                <Flex>
                  <Balance
                    mt="4px"
                    bold={!isMobile}
                    fontSize={isMobile ? '14px' : '16px'}
                    color={hasStaked ? 'primary' : 'textDisabled'}
                    decimals={hasStaked ? 5 : 1}
                    value={hasStaked ? stakedTokenBalance : 0}
                  />
                </Flex>
                {hasStaked ? (
                  <Balance
                    display="inline"
                    fontSize="12px"
                    color="textSubtle"
                    decimals={2}
                    prefix="~"
                    value={stakedTokenDollarBalance}
                    unit=" USD"
                  />
                ) : (
                  <Text mt="4px" fontSize="12px" color="textDisabled">
                    0 USD
                  </Text>
                )}
              </Box>
            </Flex>
          </>
        )}
      </Pool.CellContent>
    </Pool.BaseCell>
  )
}

export default StakedCell
