import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { inputCard, panelCard } from '@/theme/cssBlocks'

export interface PanelCardProps extends BoxProps {
  variant?: 'inputCard' | 'lightCard'
}

const PanelCard = React.forwardRef<HTMLDivElement, PanelCardProps>(({ variant = 'lightCard', ...props }, ref) => {
  const cardStyle = variant === 'inputCard' ? inputCard : panelCard
  return <Box ref={ref} {...cardStyle} display="flex" flexDir="column" {...props} />
})

PanelCard.displayName = 'PanelCard'

/** @deprecated just use block:{@link panelCard} */
export default PanelCard
