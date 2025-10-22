import { Flex, Message, Text } from '@pancakeswap/uikit'
import Link from 'next/link'
import { ReactNode } from 'react'
import styled from 'styled-components'

type Props = {
  action?: ReactNode
  title?: ReactNode
  content?: ReactNode
}

export const LinkTitle = styled(Link).attrs({ scroll: false })`
  font-weight: bold;
  font-size: 0.875rem;
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.yellow};
`

export const ContentText = styled(Text)`
  color: ${({ theme }) => theme.colors.yellow};
  font-size: 0.875rem;
`

export function WarningTips({ action, content, ...props }: Props) {
  return (
    <Message
      p="8px"
      variant="warning"
      action={action}
      style={{
        display: 'flex',
        padding: '10px',
        alignItems: 'center',
      }}
      {...props}
    >
      <Flex
        flexDirection="column"
        style={{
          lineHeight: '24px',
        }}
      >
        {content}
      </Flex>
    </Message>
  )
}
