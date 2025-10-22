import { QuestionHelper, Text } from '@pancakeswap/uikit'
import React from 'react'

interface Props {
  label?: React.ReactNode
  children?: React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const QuestionToolTip: React.FC<Props> = ({ label, placement, children }) => (
  <QuestionHelper placement={placement} text={<Text fontSize="sm">{label}</Text>}>
    {children}
  </QuestionHelper>
)

export default QuestionToolTip
