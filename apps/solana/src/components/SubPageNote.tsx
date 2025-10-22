import { ErrorIcon, Message, MessageText } from '@pancakeswap/uikit'
import { Flex, HStack, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'

type SubPageNoteProps = {
  title: React.ReactNode
  description: React.ReactNode
}

/** this board is often for a subPage link create-pool edit-farm , to describe how to use this section */
export const SubPageNote = ({ title, description }: SubPageNoteProps) => (
  <Message variant="warning" icon={<ErrorIcon color={colors.warning50} />} style={{ borderColor: colors.warning20 }}>
    <MessageText>
      <HStack align="flex-start" spacing={3}>
        <Flex flexGrow={1} direction="column">
          <Text color={colors.textPrimary} fontWeight={600} fontSize="md">
            {title}
          </Text>
          <Text pt={1} as="div" color={colors.textPrimary} fontSize="sm">
            {description}
          </Text>
        </Flex>
      </HStack>
    </MessageText>
  </Message>
)

export default SubPageNote
