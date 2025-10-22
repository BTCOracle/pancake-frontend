import { useTranslation } from '@pancakeswap/localization'
import { ArrowForwardIcon, Link, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import React from 'react'
import styled from 'styled-components'

const link = 'https://docs.pancakeswap.finance/protocol/cake-tokenomics'
export const RedeemHeader: React.FC = () => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  return (
    <Wrapper isMobile>
      <Content $isMobile={isMobile}>
        <TextContent>
          <Title $isMobile={isMobile}>{t('Redeem Staked CAKE')}</Title>
          <SubText $isMobile={isMobile}>
            {t('You may now redeem previously locked CAKE and claim remaining rewards.')}
            {isMobile && (
              <AnnouncementLinkMobile href={link} external>
                <LinkText>
                  {t('View details')}
                  {' >>'}
                </LinkText>
              </AnnouncementLinkMobile>
            )}
          </SubText>
          {!isMobile && (
            <AnnouncementLink href={link} external>
              <LinkText>{t('View detailed announcement')}</LinkText>
              <StyledArrowForwardIcon />
            </AnnouncementLink>
          )}
        </TextContent>

        {!isMobile && (
          <ImageWrapper>
            <StyledImage src={`${ASSET_CDN}/web/vecake/vecake.png`} alt="redeem" />
          </ImageWrapper>
        )}
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ isMobile: boolean }>`
  padding: 40px 16px;
  margin-top: ${({ isMobile }) => (isMobile ? '0' : '40px')};
  margin-bottom: 24px;
  position: relative;
`

const Content = styled.div<{ $isMobile: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: ${({ $isMobile }) => ($isMobile ? 'column' : 'row')};
  gap: 24px;
`

const TextContent = styled.div`
  flex: 1;
`

const Title = styled.h1<{ $isMobile: boolean }>`
  font-family: Kanit;
  font-size: 64px;
  font-style: normal;
  font-weight: 600;
  line-height: 110%;
  font-family: Kanit;
  font-size: ${({ $isMobile }) => ($isMobile ? '32px' : '64px')};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 16px;
`

const SubText = styled.p<{ $isMobile: boolean }>`
  font-family: Kanit;
  font-weight: 400;
  font-size: 16px;
  line-height: 120%;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ $isMobile }) => ($isMobile ? '0' : '24px')};
`

const AnnouncementLinkMobile = styled(Link)`
  display: inline;
  font-family: Kanit;
  font-weight: 600;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: 0%;
  color: ${({ theme }) => theme.colors.primary60};
`

const AnnouncementLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  font-family: Kanit;
  font-weight: 600;
  font-size: 16px;
  line-height: 120%;
  letter-spacing: 3%;
  vertical-align: middle;
  color: ${({ theme }) => theme.colors.primary60};
`

const LinkText = styled.span`
  font-family: Kanit;
`

const StyledArrowForwardIcon = styled(ArrowForwardIcon)`
  margin-left: 4px;
  fill: ${({ theme }) => theme.colors.primary60};
`

const ImageWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  flex-shrink: 0;
  margin-left: auto;
`

const StyledImage = styled.img`
  width: 335px;
  height: 206px;
`
