import { responsiveStyle } from '@pancakeswap/uikit'
import { style } from '@vanilla-extract/css'

export const modalWrapperClass = style([
  style({
    display: 'flex',
  }),
  responsiveStyle({
    xs: {
      width: '100%',
      marginBottom: 0,
    },
    md: {
      height: '490px',
    },
    lg: {
      width: '667px',
    },
  }),
])
