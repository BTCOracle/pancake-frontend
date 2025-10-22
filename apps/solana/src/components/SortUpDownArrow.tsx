import { Box } from '@chakra-ui/react'
import SortDownIcon from '@/icons/misc/SortDownIcon'
import { SvgBoxIcon } from '@/icons/type'

export default function SortUpDownArrow(props: SvgBoxIcon & { isDown?: boolean }) {
  const { width = 6, height = 6, isDown, ...restProps } = props
  return (
    <Box {...restProps} width={width} height={height} transition="300ms" transform={`rotateZ(${isDown ? '180deg' : '0deg'})`}>
      <SortDownIcon />
    </Box>
  )
}
