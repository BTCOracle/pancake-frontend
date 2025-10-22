import { Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useAtomValue } from 'jotai'
import React from 'react'
import styled from 'styled-components'
import { homePageDataAtom } from './atom/homePageDataAtom'
import { Partners } from './Partners'
import { StatsSummary } from './StatsSummary'

const getContainerPadding = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '24px 0px'
  if (isTablet) return '24px 40px'
  return '24px'
}

const Container = styled.div<{ isMobile: boolean; isTablet: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ isMobile, isTablet }) => getContainerPadding(isMobile, isTablet)};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  overflow: visible;
  position: relative;
`

const BannerMediaContainer = styled.div`
  max-width: 320px;
  width: 100%;
  margin-bottom: 24px;
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
`

const BannerVideo = styled.video`
  width: 100%;
`

const Highlight1 = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color || theme.colors.primary60};
`

const Highlight2 = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color || theme.colors.secondary};
`

const getHeadlineFontSize = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '32px'
  if (isTablet) return '48px'
  return '64px'
}

const getHeadlineMarginTop = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '0px'
  if (isTablet) return '280px'
  return '280px'
}

const HeadlineText = styled(Text)<{ isMobile: boolean; isTablet: boolean }>`
  font-family: Kanit;
  font-weight: 600;
  font-size: ${({ isMobile, isTablet }) => getHeadlineFontSize(isMobile, isTablet)};
  line-height: 1.1;
  letter-spacing: -1%;
  text-align: center;
  margin-top: ${({ isMobile, isTablet }) => getHeadlineMarginTop(isMobile, isTablet)};
`

const BunnyVideoUrl = `${ASSET_CDN}/web/landing/bunny.webm`

export const PancakeBanner: React.FC = () => {
  const { partners, stats } = useAtomValue(homePageDataAtom)
  const { isMobile, isTablet } = useMatchBreakpoints()

  return (
    <Container isMobile={isMobile} isTablet={isTablet}>
      <BannerMediaContainer>
        {!isMobile && (
          <BannerVideo autoPlay loop muted playsInline>
            <source src={BunnyVideoUrl} type="video/webm" />
          </BannerVideo>
        )}
      </BannerMediaContainer>
      <HeadlineText isMobile={isMobile} isTablet={isTablet}>
        Used by <Highlight1>millions.</Highlight1> Trusted with <Highlight2>billions.</Highlight2>
      </HeadlineText>
      <StatsSummary stats={stats} />
      {!isMobile && <Partners partners={partners} />}
    </Container>
  )
}
