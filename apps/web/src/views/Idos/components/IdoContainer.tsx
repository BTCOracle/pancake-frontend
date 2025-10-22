import { Container } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
import { Address } from 'viem'

import { IDOFAQs } from '../config'
import IdoQuestions from './IdoQuestions'
import IdoLayout, { IdoLayoutWrapper } from './IfoLayout'
import { SectionBackground } from './SectionBackground'

interface TypeProps {
  idoSection: ReactNode
  idoSteps: ReactNode
  idoAddress?: Address
  idoFaqs?: IDOFAQs
}

const IdoContainer: React.FC<React.PropsWithChildren<TypeProps>> = ({ idoSection, idoFaqs }) => {
  return (
    <>
      <IdoLayout id="current-ido">
        <SectionBackground>
          <Container px="0">
            <IdoLayoutWrapper>{idoSection}</IdoLayoutWrapper>
          </Container>
        </SectionBackground>
        {idoFaqs ? <IdoQuestions faqs={idoFaqs} /> : null}
      </IdoLayout>
    </>
  )
}

export default IdoContainer
