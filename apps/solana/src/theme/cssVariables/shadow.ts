import { shadows as PCSShadows } from '@pancakeswap/uikit'
import { colors } from './colors'

export const shadows: typeof PCSShadows & { bigCard: string; appMask: string } = {
  ...PCSShadows,
  bigCard: '0px 8px 48px 0px rgba(79, 83, 243, 0.10)',
  appMask: '0px 8px 0px 100vmax rgba(0, 0, 0, 0.4)',
  focus: `0px 0px 0px 1px ${colors.secondary}, 0px 0px 0px 4px rgba(118, 69, 217, 0.2)`
}
