import { Container, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
import { Address } from 'viem'

import { IFOFAQs } from '../ifov2.types'
import IfoQuestions from './IfoQuestions'
import HowToTakePart from './HowToTakePart'
import { SectionBackground } from './SectionBackground'
import DefaultQuestions from './IfoQuestions/DefaultQuestions'

interface TypeProps {
  ifoSection: ReactNode
  ifoSteps: ReactNode
  ifoAddress?: Address
  ifoFaqs?: IFOFAQs
}

const IfoContainer: React.FC<React.PropsWithChildren<TypeProps>> = ({ ifoSection, ifoFaqs }) => {
  const { isMobile } = useMatchBreakpoints()
  return (
    <>
      <SectionBackground>
        <Container px={isMobile ? '16px' : '0px'}>{ifoSection}</Container>
      </SectionBackground>
      <HowToTakePart />
      {ifoFaqs ? <IfoQuestions faqs={ifoFaqs} /> : <DefaultQuestions />}
    </>
  )
}

export default IfoContainer
