import { numberInputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(numberInputAnatomy.keys)

const filledStyle = definePartsStyle({
  field: {
    width: '210px',
    fontSize: '14px',
    bg: colors.inputBg,
    borderRadius: '12px',
    _hover: {
      bg: colors.inputBg
    },
    _focusVisible: {
      borderColor: 'transparent',
      boxShadow: 'none'
    },
    _invalid: {
      border: '1px solid red'
    }
  },
  stepperGroup: {
    display: 'none'
  }
})
const filledDarkStyle = definePartsStyle({
  field: {
    width: '210px',
    fontSize: '14px',
    bg: colors.inputBg,
    borderRadius: '12px',
    _hover: {
      bg: colors.inputBg
    },
    _focus: {
      bg: colors.inputBg
    },
    _focusVisible: {
      bg: colors.inputBg,
      borderColor: 'transparent',
      boxShadow: 'none'
    },
    _invalid: {
      border: '1px solid red'
    }
  }
})
const cleanStyle = definePartsStyle({
  field: {
    fontSize: 'xl',
    fontWeight: 'medium',
    color: colors.textPrimary,
    bg: 'transparent',
    padding: 0,
    height: 'auto',
    lineHeight: 'normal',
    boxShadow: 'none',
    borderRadius: 0,
    _invalid: {
      border: '1px solid red'
    }
  }
})

export const NumberInput = defineMultiStyleConfig({
  variants: { filled: filledStyle, filledDark: filledDarkStyle, clean: cleanStyle },
  defaultProps: { variant: 'filled' }
})
