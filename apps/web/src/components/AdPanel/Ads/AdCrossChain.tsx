import { useTranslation } from '@pancakeswap/localization'
import { Link, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'
import { AdPlayerProps } from '../ads.types'

const learnMoreLink =
  'https://blog.pancakeswap.finance/articles/crosschain-swaps?utm_source=Website&utm_medium=banner&utm_campaign=homepage&utm_id=Crosschain'
const actionLink = '/swap?utm_source=Website&utm_medium=banner&utm_campaign=homepage&utm_id=Crosschain'
const imgURL = `${ASSET_CDN}/web/banners/crosschain_banner_desktop.png`

export function AdCrossChain(props: AdPlayerProps) {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  return (
    <AdCard imageUrl={imgURL} {...props}>
      <BodyText mb="0">
        <Text as="span" color="text" bold fontSize="14px">
          {t('One-Click Cross-Chain Swaps Are Now Live.')}
        </Text>
      </BodyText>

      <Link style={!isMobile ? { display: 'inline' } : {}} fontSize="14px" href={actionLink}>
        {t('Swap Now')}
      </Link>

      <AdButton mt="16px" href={learnMoreLink} externalIcon isExternalLink>
        {t('Learn More')}
      </AdButton>
    </AdCard>
  )
}
