/* eslint-disable react/no-array-index-key */
import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, CardHeader, Heading, Text, Container } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import FoldableText from 'components/FoldableSection/FoldableText'
import { IFOFAQs } from '../../ifov2.types'

const StyledCardHeader = styled(CardHeader)`
  background: ${({ theme }) =>
    theme.isDark
      ? 'linear-gradient(112deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(112deg, #F2ECF2 0%, #E8F2F6 100%)'};
  padding: 24px;
`

const StyledHeading = styled(Heading)`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 24px;
  font-weight: 600;
`

const IfoQuestions: React.FC<{ faqs: IFOFAQs }> = ({ faqs }) => {
  const { t } = useTranslation()

  return (
    <Container>
      <Card mt="24px" style={{ maxWidth: '800px' }} mx="auto">
        <StyledCardHeader>
          <StyledHeading>{t('FAQ')}</StyledHeading>
        </StyledCardHeader>
        <CardBody>
          {faqs.map(({ title, description }, i, { length }) => {
            return (
              <FoldableText key={i} mb={i + 1 === length ? '' : '24px'} title={t(title.i18nText)}>
                <Text color="textSubtle" as="p">
                  {t(description.i18nText)}
                </Text>
              </FoldableText>
            )
          })}
        </CardBody>
      </Card>
    </Container>
  )
}

export default IfoQuestions
