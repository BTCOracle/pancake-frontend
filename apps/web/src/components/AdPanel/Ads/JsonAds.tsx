import { useTranslation } from '@pancakeswap/localization'
import { Link, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'
import { AdPlayerProps, I18nText, RemoteAds } from '../ads.types'

interface JsonAdsProps extends AdPlayerProps {
  ad: RemoteAds
}

export const JsonAds: React.FC<JsonAdsProps> = ({ ad, ...props }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const img = isMobile && ad.imgUrlMobile ? ad.imgUrlMobile : ad.imgUrl

  // helper to resolve i18nText (string | { mobile, desktop })
  const resolveI18nText = (i18nText: I18nText) => {
    if (typeof i18nText === 'string') return t(i18nText)
    return t(isMobile ? i18nText.mobile : i18nText.desktop)
  }

  return (
    <AdCard imageUrl={img} {...props}>
      {ad.texts && (
        <BodyText mb="0">
          {ad.texts.map((item, index) => {
            if (typeof item === 'string') {
              return t(item)
            }
            const content = resolveI18nText(item.i18nText)
            if (item.link) {
              return (
                <Link key={index} fontSize="inherit" href={item.link} color="secondary" bold style={item.style}>
                  {content}
                </Link>
              )
            }
            if (item.highlight) {
              return (
                <Text key={index} as="span" fontSize="inherit" color="secondary" bold style={item.style}>
                  {content}
                </Text>
              )
            }
            if (item.style) {
              return (
                <Text key={index} as="span" fontSize="inherit" style={item.style}>
                  {content}
                </Text>
              )
            }
            return content
          })}
        </BodyText>
      )}
      {ad.actions?.map((action, idx) => {
        if (action.type === 'button') {
          const external = action.external ?? true
          const content = resolveI18nText(action.i18nText)
          return (
            <AdButton
              key={idx}
              href={action.link}
              isExternalLink={external}
              externalIcon={external}
              style={action.style}
            >
              {content}
            </AdButton>
          )
        }
        return null
      })}
    </AdCard>
  )
}
