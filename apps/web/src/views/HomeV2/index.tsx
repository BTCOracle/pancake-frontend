import {
  ArrowDownIcon,
  Box,
  domAnimation,
  Flex,
  LazyAnimatePresence,
  MotionBox,
  Skeleton,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import { Suspense } from 'react'
import styled from 'styled-components'
import SimpleSwapForHomePage from 'views/SwapSimplify/SimpleSwapForHomePage'
import { handleHomepageSnapDown } from 'views/HomeV2/util/handleHomepageSnapDown'
import { homePageDataAtom } from './atom/homePageDataAtom'
import { ScrollDownArrow } from './cards/component/ScrollDownArrow'
import { FeaturesCard } from './cards/FeaturesCard'
import { RowLayout } from './component/RowLayout'
import { ScrollableFullScreen } from './component/ScrollableFullScreen'
import { FavoriteDEXBanner } from './FavoriteDEXBanner'
import { PancakeBanner } from './PancakeBanner'
import { SwapWithBestPriceCard } from './cards/SwapWithBestPriceCard'
import { EarnTradingFeesCard } from './cards/EarnTradingFeesCard'
import { BridgeCryptoCard } from './cards/BridgeCryptoCard'

const MobileContainer = styled(Box)`
  scroll-snap-align: start;
`

// Helper functions for tablet layout
const getSidePadding = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '16px'
  if (isTablet) return '20px'
  return '24px'
}

const getMarginTopForBanner = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return `40px`
  if (isTablet) return `160px`
  return `200px`
}

const getMarginTop = (isMobile: boolean, isTablet: boolean, base: number) => {
  if (isMobile) return base
  if (isTablet) return base * 1.2
  return base * 1.5
}

const BgBox = styled(Box)`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
`

const StyledSkeleton = styled(Skeleton)`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  opacity: 0.01;
`
export const HomeV2 = () => {
  return (
    <Suspense
      fallback={
        <BgBox
          style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <StyledSkeleton animation="waves" width="80%" height="50vh" variant="round" borderRadius="0" />
        </BgBox>
      }
    >
      <BgBox>
        <HomeV2Inner />
      </BgBox>
    </Suspense>
  )
}
const HomeV2Inner = () => {
  const { tokens, chains, pools, currencies } = useAtomValue(homePageDataAtom)

  const { isMobile, isTablet } = useMatchBreakpoints()
  const Container = isTablet || isMobile ? MobileContainer : ScrollableFullScreen

  const showArrow = isMobile || isTablet

  return (
    <>
      <Container>
        <RowLayout sidePadding="0">
          <LazyAnimatePresence features={domAnimation}>
            <FavoriteDEXBanner chains={chains} />
            <MotionBox
              style={{
                willChange: 'transform, opacity',
                flexShrink: 0,
                flex: 1,
                width: '100%',
              }}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            >
              <SimpleSwapForHomePage />
            </MotionBox>
          </LazyAnimatePresence>
        </RowLayout>

        {showArrow && (
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            style={{ position: 'relative', height: '30px' }}
            mt="25px"
            mb="35px"
          >
            <ScrollDownArrow id="arrow-abc" isMobile={isMobile} isTablet={isTablet} onClick={handleHomepageSnapDown}>
              {/* <ChevronDownIcon width="32px" color="textSubtle" /> */}
              <ArrowDownIcon width="24px" color="textSubtle" />
            </ScrollDownArrow>
          </Flex>
        )}
      </Container>

      <RowLayout
        className="homepage-snap"
        sidePadding={getSidePadding(isMobile, isTablet)}
        mt={getMarginTop(isMobile, isTablet, 24)}
        style={{
          marginTop: getMarginTop(isMobile, isTablet, 24),
        }}
      >
        <SwapWithBestPriceCard tokens={tokens} />
        <EarnTradingFeesCard pairs={pools} />
      </RowLayout>

      <RowLayout
        sidePadding={getSidePadding(isMobile, isTablet)}
        mt={getMarginTop(isMobile, isTablet, 24)}
        style={{
          marginTop: getMarginTop(isMobile, isTablet, 24),
        }}
      >
        <BridgeCryptoCard chains={chains} currencies={currencies} />
      </RowLayout>

      <FeaturesCard />

      <RowLayout
        className="homepage-snap"
        fullScreen
        sidePadding="0px"
        style={{
          marginTop: getMarginTopForBanner(isMobile, isTablet),
        }}
      >
        <PancakeBanner />
      </RowLayout>
    </>
  )
}
