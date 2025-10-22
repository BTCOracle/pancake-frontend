import { chainNames } from '@pancakeswap/chains'
import { PredictionStatus } from '@pancakeswap/prediction'
import { Box, Button, Flex, HelpIcon, PrizeIcon, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGetPredictionsStatus } from 'state/predictions/hooks'
import { styled } from 'styled-components'
import { TokenSelectorV2 } from './TokenSelectorV2'
import FlexRow from './FlexRow'
import HistoryButton from './HistoryButton'
import { TimerLabel } from './Label'
import PrevNextNav from './PrevNextNav'

const SetCol = styled.div`
  position: relative;
  flex: none;
  width: 170px;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 270px;
  }
`

const HelpButtonWrapper = styled.div`
  order: 1;
  margin: 0 2px 0 8px;

  ${({ theme }) => theme.mediaQueries.sm} {
    order: 2;
    margin: 0 0 0 8px;
  }
`

const TimerLabelWrapper = styled.div`
  order: 3;
  width: 100px;

  ${({ theme }) => theme.mediaQueries.sm} {
    order: 1;
    width: auto;
  }
`

const TimerLabelMobileWrapper = styled.div`
  order: 1;
  width: 100px;
`

const LeaderboardButtonWrapper = styled.div`
  display: block;

  order: 2;
  margin: 0 8px 0 0;

  ${({ theme }) => theme.mediaQueries.sm} {
    order: 3;
    margin: 0 0 0 8px;
  }
`

const ButtonWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.mediaQueries.lg} {
    display: block;
    margin-left: 8px;
  }
`

const Menu = () => {
  const { query } = useRouter()
  const { chainId } = useActiveChainId()
  const { isMobile } = useMatchBreakpoints()
  const status = useGetPredictionsStatus()

  const menuRef = useRef<HTMLDivElement>(null)
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined)

  const leaderboardUrl = useMemo(() => {
    return chainId ? `/prediction/leaderboard?chain=${chainNames[chainId]}&token=${query.token}` : ''
  }, [chainId, query.token])

  // Track menu width to control mini mode of Token Selector
  useEffect(() => {
    if (menuRef.current) {
      const observer = new ResizeObserver(() => {
        setMenuWidth(menuRef.current?.clientWidth)
      })
      observer.observe(menuRef.current)
      return () => observer.disconnect()
    }
    return () => {}
  }, [menuRef])

  return (
    <Box ref={menuRef}>
      {isMobile && (
        <FlexRow mt="8px" mb="4px" justifyContent="center">
          <TokenSelectorV2 />
        </FlexRow>
      )}
      <FlexRow alignItems="center" p="16px" width="100%">
        <SetCol>
          {!isMobile ? (
            <TokenSelectorV2 menuWidth={menuWidth} />
          ) : (
            <TimerLabelMobileWrapper>
              <TimerLabel />
            </TimerLabelMobileWrapper>
          )}
        </SetCol>
        {status === PredictionStatus.LIVE && (
          <>
            <FlexRow justifyContent="center">
              <PrevNextNav />
            </FlexRow>
            <SetCol>
              <Flex alignItems="center" justifyContent="flex-end">
                {!isMobile && (
                  <TimerLabelWrapper>
                    <TimerLabel />
                  </TimerLabelWrapper>
                )}
                <HelpButtonWrapper>
                  <Button
                    variant="subtle"
                    as="a"
                    href="https://docs.pancakeswap.finance/products/prediction"
                    target="_blank"
                    rel="noreferrer noopener"
                    width="48px"
                  >
                    <HelpIcon width="24px" color="white" />
                  </Button>
                </HelpButtonWrapper>
                <LeaderboardButtonWrapper>
                  <Link href={leaderboardUrl} passHref>
                    <Button variant="subtle" width="48px">
                      <PrizeIcon color="white" />
                    </Button>
                  </Link>
                </LeaderboardButtonWrapper>
                <ButtonWrapper style={{ order: 4 }}>
                  <HistoryButton />
                </ButtonWrapper>
              </Flex>
            </SetCol>
          </>
        )}
      </FlexRow>
    </Box>
  )
}

export default Menu
