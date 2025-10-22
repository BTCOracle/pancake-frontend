import { useTranslation } from '@pancakeswap/localization'
import { Link, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'

import { AdPlayerProps } from '../ads.types'
import { getImageUrl } from '../utils'

const tradingCompetitionConfig: {
  [key: string]: {
    imgUrl: string
    swapUrl: string
    learnMoreUrl: string
    reward: string
    unit: string
    endTimestamp: number
  }
} = {}

export const AdTradingCompetition = (props: AdPlayerProps & { token: string }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { token, ...rest } = props
  const { unit, reward, imgUrl, swapUrl, learnMoreUrl } = tradingCompetitionConfig[token]

  return (
    <AdCard imageUrl={getImageUrl(imgUrl)} {...rest}>
      <BodyText mb="0">
        {isMobile
          ? t('Swap %token% to win a share of', { token: token.toUpperCase() })
          : t('Join %token% Trading Competition to share of', { token: token.toUpperCase() })}{' '}
        {unit === '$' ? `$${reward}` : `${reward} ${unit}`}.{' '}
        <Link style={!isMobile ? { display: 'inline' } : {}} fontSize="inherit" href={swapUrl} color="secondary" bold>
          {t('Swap Now')}
        </Link>
      </BodyText>
      <AdButton mt="16px" href={learnMoreUrl} externalIcon isExternalLink>
        {t('Learn More')}
      </AdButton>
    </AdCard>
  )
}

export const useTradingCompetitionAds = () => {
  return useMemo(() => {
    const currentTime = Math.floor(Date.now() / 1000)
    return Object.keys(tradingCompetitionConfig)
      .filter((token) => {
        const { endTimestamp } = tradingCompetitionConfig[token]
        return currentTime <= endTimestamp
      })
      .reverse()
      .map((token) => ({
        id: `ad-${token}-tc`,
        component: <AdTradingCompetition key={token} token={token} />,
      }))
  }, [])
}
