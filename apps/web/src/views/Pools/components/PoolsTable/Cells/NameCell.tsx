import { useTranslation } from '@pancakeswap/localization'
import { checkIsBoostedPool } from '@pancakeswap/pools'
import { Token } from '@pancakeswap/sdk'
import { Box, Flex, Skeleton, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { FarmWidget, Pool } from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'
import { TokenPairImage } from 'components/TokenImage'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { ReactNode, useMemo } from 'react'
import { styled } from 'styled-components'

const { AlpBoostedTag } = FarmWidget.Tags

interface NameCellProps {
  pool: Pool.DeserializedPool<Token>
  tooltip?: ReactNode
}

export const StyledCell = styled(Pool.BaseCell)`
  flex: 5;
  flex-direction: row;
  padding-left: 12px;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 0 0 210px;
    padding-left: 32px;
  }
`

const NameCell: React.FC<React.PropsWithChildren<NameCellProps>> = ({ pool, tooltip }) => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const { isMobile } = useMatchBreakpoints()
  const { sousId, stakingToken, earningToken, userData, isFinished, totalStaked } = pool

  const stakingTokenSymbol = stakingToken.symbol
  const earningTokenSymbol = earningToken.symbol

  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const showStakedTag = stakedBalance.gt(0)

  const title: React.ReactNode = `${t('Earn.verb')} ${earningTokenSymbol}`
  const subtitle: React.ReactNode = `${t('Stake')} ${stakingTokenSymbol}`
  const showSubtitle = sousId !== 0 || (sousId === 0 && !isMobile)

  const isLoaded = useMemo(() => {
    return totalStaked && totalStaked.gte(0)
  }, [totalStaked])

  const isBoostedPool = useMemo(
    () => Boolean(!isFinished && chainId && checkIsBoostedPool(pool.contractAddress, chainId)),
    [pool, isFinished, chainId],
  )

  return (
    <StyledCell role="cell">
      {isLoaded ? (
        <>
          <TokenPairImage
            primaryToken={earningToken}
            secondaryToken={stakingToken}
            mr="8px"
            width={40}
            height={40}
            style={{ minWidth: 40 }}
          />
          <Pool.CellContent>
            {showStakedTag ? (
              <Text fontSize="12px" bold color={isFinished ? 'failure' : 'secondary'} textTransform="uppercase">
                {t('Staked')}
              </Text>
            ) : null}
            <Flex>
              <Text bold={!isMobile} small={isMobile}>
                {title}
              </Text>
              {tooltip}
            </Flex>
            {showSubtitle && (
              <Text fontSize="12px" color="textSubtle">
                {subtitle}
              </Text>
            )}
            {!isMobile && isBoostedPool && (
              <Box width="fit-content" mt="4px">
                <AlpBoostedTag scale="sm" />
              </Box>
            )}
          </Pool.CellContent>
        </>
      ) : (
        <>
          <Skeleton mr="8px" width={36} height={36} variant="circle" />
          <Pool.CellContent>
            <Skeleton width={30} height={12} mb="4px" />
            <Skeleton width={65} height={12} />
          </Pool.CellContent>
        </>
      )}
    </StyledCell>
  )
}

export default NameCell
