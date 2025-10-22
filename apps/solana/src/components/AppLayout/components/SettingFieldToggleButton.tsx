import { Box, Flex, HStack } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'react-feather'
import { ArrowDropDownIcon } from '@pancakeswap/uikit'
import { colors } from '@/theme/cssVariables'
import { inputShadowInsetStyle } from '@/theme/cssBlocks'

export function SettingFieldToggleButton(props: { isOpen?: boolean; renderContent?: ReactNode }) {
  return (
    <Flex
      bg={props.isOpen ? undefined : colors.input}
      userSelect="none"
      rounded="2xl"
      px={4}
      height="40px"
      alignItems="center"
      boxShadow={inputShadowInsetStyle.boxShadow}
      borderWidth="1px"
      borderColor={colors.inputSecondary}
      borderStyle="solid"
      gap={2}
      fontSize="sm"
      color={props.isOpen ? colors.textSecondary : colors.textPrimary}
    >
      {props.isOpen ? (
        <Box p={1}>
          <ChevronUp size="18px" />
        </Box>
      ) : (
        <HStack>
          <Box overflow="hidden" maxWidth="75vw" fontSize="16px">
            {props.renderContent}
          </Box>
          <ArrowDropDownIcon color="text" />
        </HStack>
      )}
    </Flex>
  )
}
