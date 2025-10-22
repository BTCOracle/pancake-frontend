import { useTranslation } from '@pancakeswap/localization'
import { Box, Container, Flex, FlexGap, Heading, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { useCurrentIDOConfig } from '../hooks/ido/useCurrentIDOConfig'

const StyledHero = styled(Box)`
  position: relative;
  overflow: hidden;
`

const StyledHeading = styled(Heading)`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text};
`

const StyledSubTitle = styled(Text)`
  font-size: 16px;
  display: inline;
`

const Hero = () => {
  const { t } = useTranslation()
  const currentIdoConfig = useCurrentIDOConfig()

  // const router = useRouter()
  // const handleClick = () => {
  //   const howToElem = document.getElementById('ifo-how-to')
  //   if (howToElem != null) {
  //     howToElem.scrollIntoView()
  //   } else {
  //     router.push('/ido#ifo-how-to')
  //   }
  // }

  if (!currentIdoConfig) {
    return null
  }

  return (
    <Box mb="24px">
      <StyledHero>
        <Container position="relative" zIndex="2" mx="0px" px="0px">
          <Flex
            justifyContent="space-between"
            flexDirection={['column', 'column', 'column', 'column']}
            style={{ gap: '4px' }}
          >
            <Box>
              <StyledHeading as="h1" mb={['12px', '12px', '12px', '12px']}>
                <FlexGap alignItems="center" gap="8px">
                  {t('Exclusive TGE')}
                </FlexGap>
              </StyledHeading>
              <p>
                <StyledSubTitle bold>{currentIdoConfig.tgeTitle}</StyledSubTitle>
                <StyledSubTitle>: {currentIdoConfig.tgeSubtitle}</StyledSubTitle>
              </p>
            </Box>

            {/* <Text onClick={handleClick} mt="0.375rem" bold color="#02919D" style={{ cursor: 'pointer' }}>
              {t('How does it work?')}
            </Text> */}
          </Flex>
        </Container>
      </StyledHero>
    </Box>
  )
}

export default Hero
