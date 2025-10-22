import { useTranslation } from '@pancakeswap/localization'
import { Container, LinkExternal, Flex, Box } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
import { Address } from 'viem'

import IfoPoolVaultCard from './IfoPoolVaultCard'
import { SectionBackground } from './SectionBackground'

interface TypeProps {
  ifoSection: ReactNode
  ifoSteps: ReactNode
  faq?: ReactNode
  ifoBasicSaleType?: number
  ifoAddress?: Address
}

const IfoContainer: React.FC<React.PropsWithChildren<TypeProps>> = ({
  ifoSection,
  ifoSteps,
  faq,
  ifoBasicSaleType,
  ifoAddress,
}) => {
  const { t } = useTranslation()

  return (
    <Box id="current-ifo" py={['24px', '24px', '40px']}>
      <Container>
        <Flex flexDirection={['column', null, 'row']} style={{ columnGap: '32px' }} alignItems="flex-start">
          <IfoPoolVaultCard ifoBasicSaleType={ifoBasicSaleType} ifoAddress={ifoAddress} />
          {ifoSection}
        </Flex>
      </Container>
      <SectionBackground>
        <Container>{ifoSteps}</Container>
      </SectionBackground>
      {faq}
      <LinkExternal
        href="https://docs.pancakeswap.finance/ecosystem-and-partnerships/business-partnerships/initial-farm-offerings-ifos"
        mx="auto"
        mt="16px"
      >
        {t('Apply to run an IFO!')}
      </LinkExternal>
    </Box>
  )
}

export default IfoContainer
