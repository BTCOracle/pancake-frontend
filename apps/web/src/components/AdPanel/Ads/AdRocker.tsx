import { useTranslation } from '@pancakeswap/localization'
import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'

import { AdPlayerProps } from '../ads.types'
import { getImageUrl } from '../utils'

const actionLink = 'https://four.meme/'

export const AdRocker = (props: AdPlayerProps) => {
  const { t } = useTranslation()

  return (
    <AdCard imageUrl={getImageUrl('rocker_meme_career')} {...props}>
      <BodyText>{t('Rocker launching your meme career')}</BodyText>

      <AdButton mt="20px" href={actionLink} externalIcon isExternalLink>
        {t('Learn More')}
      </AdButton>
    </AdCard>
  )
}
