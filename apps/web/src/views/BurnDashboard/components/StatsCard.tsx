import { Card, CardProps, Text, TextProps } from '@pancakeswap/uikit'
import { PropsWithChildren } from 'react'

export const StatsCard = ({ children, ...props }: PropsWithChildren<CardProps>) => {
  return (
    <Card innerCardProps={{ p: '16px' }} {...props}>
      {children}
    </Card>
  )
}

export const StatsCardHeader = ({ children, ...props }: PropsWithChildren<TextProps>) => {
  return (
    <Text fontSize="18px" color="secondary" bold {...props}>
      {children}
    </Text>
  )
}
