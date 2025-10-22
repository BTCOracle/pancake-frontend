import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'

import { AdPlayerProps } from '../ads.types'
import { getImageUrl } from '../utils'

const actionLink = 'https://springboard.pancakeswap.finance/'

export const AdSpringboard = (props: AdPlayerProps) => {
  const { t } = useTranslation()

  return (
    <AdCard imageUrl={getImageUrl('springboard')} {...props}>
      <BodyText mb="0">
        {t('Create & Launch Your Token in minutes, on our ')}

        <Text fontSize="inherit" as="span" color="secondary" bold>
          {t('SpringBoard!!')}
        </Text>
      </BodyText>
      <AdButton mt="16px" href={actionLink} externalIcon isExternalLink>
        {t('Learn More')}
      </AdButton>
    </AdCard>
  )
}
