import { Box, PopoverProps, Text, TextProps } from '@chakra-ui/react'
import { ReactNode } from 'react'
import InfoCircleIcon from '@/icons/misc/InfoCircleIcon'
import QuestionCircleIcon from '@/icons/misc/QuestionCircleIcon'
import { SvgIcon } from '@/icons/type'
import Tooltip from './Tooltip'

/**
 * component \
 * for this case, click tooltip icon should show a tooltip even in mobile, but chakra didn't support this
 */
export function QuestionToolTip(props: {
  label?: ReactNode
  /** @default 'question' */
  iconType?: 'question' | 'info'
  // iconSize?: string
  iconProps?: Omit<SvgIcon, 'ref'>
  textProps?: TextProps
  placement?: PopoverProps['placement']

  children?: ReactNode
}) {
  return (
    <Tooltip
      label={
        <Text fontSize="sm" {...props.textProps}>
          {props.label}
        </Text>
      }
      placement={props.placement}
    >
      <Box cursor={props.label ? 'pointer' : undefined}>
        {props.children ||
          (props.iconType === 'info' ? (
            <InfoCircleIcon style={{ display: 'block' }} {...props.iconProps} />
          ) : (
            <QuestionCircleIcon style={{ display: 'block' }} {...props.iconProps} />
          ))}
      </Box>
    </Tooltip>
  )
}
