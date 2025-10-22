/**
 * for faster development, just pass css blocks to chakra-ui component
 */

import { SystemProps } from '@chakra-ui/react'
import { colors, sizes } from './cssVariables'

export const heroGridientColorCSSBlock: SystemProps = {
  color: colors.textSecondary,
  fontSize: sizes.textHeroTitle,
  fontWeight: '600'
}

export const panelCard: SystemProps = {
  bg: colors.cardBg,
  border: `1px solid ${colors.cardBorder01}`,
  borderBottomWidth: '2px',
  borderRadius: '24px',
  overflow: 'hidden',
  lineHeight: 1.5
}

export const inputCard: SystemProps = {
  color: colors.textSubtle,
  bg: colors.inputBg,
  // border: `1px solid ${colors.inputBorder}`,
  borderBottomWidth: '2px',
  borderRadius: '24px',
  lineHeight: 1.5
}

export const inputFocusStyle = {
  boxShadow: `0px 0px 0px 1px #7645D9,0px 0px 0px 4px rgba(118,69,217,0.6)`
}

export const inputShadowInsetStyle = {
  boxShadow: `inset 0px 2px 2px -1px rgba(74,74,104,0.1)`
}
