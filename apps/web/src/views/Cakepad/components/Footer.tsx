import { useTranslation } from '@pancakeswap/localization'
import { CardBody, FlexGap, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import useIfo from '../hooks/useIfo'
import FooterIcons from './FooterIcons'

export const Footer: React.FC = () => {
  const { t } = useTranslation()
  const { config: currentIfoConfig } = useIfo()
  const { isMobile } = useMatchBreakpoints()
  return (
    <CardBody>
      <FlexGap gap="12px" width="100%" flexDirection={isMobile ? 'column' : 'row'} alignItems="center">
        <Text
          style={{ flex: 1 }}
          color="textSubtle"
          fontSize="14px"
          lineHeight="16.8px"
          textAlign={isMobile ? 'center' : 'left'}
        >
          {t(currentIfoConfig?.description.i18nText)}
        </Text>
        <FooterIcons />
      </FlexGap>
    </CardBody>
  )
}
