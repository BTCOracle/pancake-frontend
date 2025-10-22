import { PencilIcon } from '@pancakeswap/uikit'
import { colors } from '@/theme/cssVariables'

import { SvgIcon } from '../type'

export default function EditIcon(props: SvgIcon) {
  const { width = 18, height = 18, fill = colors.textSubtle } = props

  return <PencilIcon width={width} height={height} color={fill} {...props} />
}
