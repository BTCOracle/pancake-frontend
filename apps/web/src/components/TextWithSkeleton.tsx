import React from 'react'
import { SkeletonText, type TextProps } from '@pancakeswap/uikit'

interface TextWithSkeletonProps extends TextProps {
  loading: boolean
  width: number
  height?: number
}

const TextWithSkeleton: React.FC<React.PropsWithChildren<TextWithSkeletonProps>> = ({
  loading,
  width,
  height = 16,
  children,
  ...props
}) => {
  return (
    <SkeletonText loading={loading} initialWidth={width} initialHeight={height} {...props}>
      {children}
    </SkeletonText>
  )
}

export default TextWithSkeleton
