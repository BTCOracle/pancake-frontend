import { BoxProps } from '@chakra-ui/react'
import { SVGProps } from 'react'

export type SvgIcon = SVGProps<SVGSVGElement>
export type SvgBoxIcon = SVGProps<SVGSVGElement> & BoxProps & Omit<React.SVGProps<SVGSVGElement>, keyof BoxProps>

// export type SvgBoxIcon = Omit<SVGProps<SVGSVGElement>, keyof BoxProps> & BoxProps
