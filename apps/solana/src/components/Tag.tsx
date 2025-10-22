import { Box, BoxProps } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { colors, sizes } from '@/theme/cssVariables'

export default function Tag(props: { children?: ReactNode } & BoxProps) {
  return (
    <Box
      sx={{
        background: colors.backgroundTransparent12,
        borderRadius: '99px',
        padding: '0 5px',
        color: colors.textSecondary,
        fontSize: sizes.textXS
      }}
      {...props}
    />
  )
}
