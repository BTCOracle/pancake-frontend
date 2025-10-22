import { Box, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { colors } from '@/theme/cssVariables'

export interface CalloutNoteProps {
  header?: ReactNode
  content?: ReactNode
}

export default function CalloutNote({ header, content: detail }: CalloutNoteProps) {
  return (
    <Box bg={colors.cardSecondary} border="1px solid" borderColor={colors.cardBorder01} rounded="24px" p={4} fontSize="sm">
      <Text mr={0.5} display="inline" color={colors.semanticError}>
        {header}:
      </Text>
      <Text display="inline" color={colors.textSubtle}>
        {detail}
      </Text>
    </Box>
  )
}
