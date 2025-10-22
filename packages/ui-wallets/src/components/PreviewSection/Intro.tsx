import { useTranslation } from '@pancakeswap/localization'
import { Image, Text, Button, AutoRow, Card, CardBody, useMatchBreakpoints } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { ASSET_CDN } from '../../config/url'

const StyledIntroCard = styled(Card)`
  width: 100%;
`

export const Intro = ({ docLink }: { docLink: string }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const content = (
    <>
      <Text textAlign="left" color="textSubtle" fontSize="12px">
        {t('Manage and store your private keys and assets securely.')}
      </Text>

      <AutoRow gap="8px" mt="4px">
        <Button as="a" color="backgroundAlt" variant="text" href={docLink} scale="xs" p="0">
          {t('How to connect')}
        </Button>
        <Text color="disabled" fontSize="12px">
          |
        </Text>
        <Button
          as="a"
          color="backgroundAlt"
          variant="text"
          href="https://pancakeswap.finance/terms-of-service"
          scale="xs"
          p="0"
        >
          {t('Disclaimer')}
        </Button>
      </AutoRow>
    </>
  )

  if (isMobile) {
    return content
  }

  return (
    <>
      <Image src={`${ASSET_CDN}/web/wallet-ui/intro.png`} width={150} height={228.72} />
      <StyledIntroCard>
        <CardBody p="16px">{content}</CardBody>
      </StyledIntroCard>
    </>
  )
}
