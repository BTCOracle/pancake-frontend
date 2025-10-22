import { Box } from '@chakra-ui/react'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import { SvgBoxIcon } from '@/icons/type'

export default function ChevronUpDownArrow(props: SvgBoxIcon & { isOpen?: boolean }) {
  const { isOpen, ...restProps } = props
  return (
    <Box width={6} height={6} transition="300ms" transform={`rotateZ(${isOpen ? '180deg' : '0deg'})`} {...restProps}>
      <ChevronDownIcon />
    </Box>
  )
}
