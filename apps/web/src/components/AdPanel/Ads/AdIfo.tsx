import { useTranslation } from '@pancakeswap/localization'
import { useActiveIfoConfigAcrossChains } from 'hooks/useIfoConfig'
import dayjs from 'dayjs'
import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'
import { Countdown } from '../Countdown'
import { AdPlayerProps } from '../ads.types'
import { getImageUrl } from '../utils'

export const AdIfo = (props: AdPlayerProps) => {
  const { t } = useTranslation()
  const ifoConfig = useActiveIfoConfigAcrossChains()

  if (!ifoConfig || dayjs().isAfter(dayjs.unix(ifoConfig.plannedStartTime || 0))) return null

  return (
    <AdCard imageUrl={getImageUrl(ifoConfig.id)} {...props}>
      <BodyText mb="8px">
        {t('%token% IFO starts in', {
          token: ifoConfig.name,
        })}
      </BodyText>

      <Countdown
        targetTime={ifoConfig.plannedStartTime || 0}
        subtleColor="rgba(0,0,0,.6)"
        background="linear-gradient(180deg, #FCC631 0%, #FF9D00 100%)"
        color="black"
        mb="8px"
      />

      <AdButton variant="text" isExternalLink href="https://pancakeswap.finance/ifo">
        {t('Get Started')}
      </AdButton>
    </AdCard>
  )
}
