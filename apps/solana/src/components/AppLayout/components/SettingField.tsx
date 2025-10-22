import { Box, Collapse, Flex, HStack, Spacer, useDisclosure } from '@chakra-ui/react'
import { Text } from '@pancakeswap/uikit'
import { ReactNode } from 'react'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import { colors } from '@/theme/cssVariables'
import { shrinkToValue } from '@/utils/shrinkToValue'

export function SettingField({
  isCollapseDefaultOpen,
  fieldName,
  tooltip,
  renderWidgetContent,
  renderToggleButton
}: {
  isCollapseDefaultOpen?: boolean
  fieldName?: string | null
  tooltip?: string | null
  renderWidgetContent?: ReactNode
  /** if provide, setting field can collapse */
  renderToggleButton?: ((isOpen: boolean) => ReactNode) | ReactNode
}) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isCollapseDefaultOpen })
  return (
    <Flex flexDir="column" flexWrap={['wrap', 'nowrap']}>
      <HStack onClick={onToggle} alignItems="center" flexWrap={['wrap', 'nowrap']}>
        <Text>{fieldName}</Text>
        {tooltip && <QuestionToolTip label={tooltip} iconProps={{ color: colors.textSubtle }} />}
        <Spacer />
        <Box cursor={renderWidgetContent ? 'pointer' : undefined}>{shrinkToValue(renderToggleButton, [isOpen])}</Box>
      </HStack>

      {renderWidgetContent && (
        <Collapse in={renderToggleButton ? isOpen : true} animateOpacity style={{ overflow: 'visible' }}>
          <Box pt={3}>{renderWidgetContent}</Box>
        </Collapse>
      )}
    </Flex>
  )
}
