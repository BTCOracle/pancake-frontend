/* eslint-disable react/no-array-index-key */
import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, CardHeader, Heading, Text } from '@pancakeswap/uikit'
import FoldableText from 'components/FoldableSection/FoldableText'
import { IDOFAQs } from 'views/Idos/config'

const IdoQuestions: React.FC<{ faqs: IDOFAQs }> = ({ faqs }) => {
  const { t } = useTranslation()

  return (
    <Card mt="24px">
      <CardHeader variant="pale">
        <Heading scale="lg">{t('FAQ')}</Heading>
      </CardHeader>
      <CardBody>
        {faqs.map(({ title, description }, i, { length }) => {
          return (
            <FoldableText key={i} mb={i + 1 === length ? '' : '24px'} title={title}>
              <Text color="textSubtle" as="p">
                {description}
              </Text>
            </FoldableText>
          )
        })}
      </CardBody>
    </Card>
  )
}

export default IdoQuestions
