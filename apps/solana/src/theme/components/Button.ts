import { colors } from '../cssVariables'

export const Button = {
  baseStyle: {
    fontWeight: '600',
    cursor: 'pointer'
  },
  sizes: {
    xs: {
      height: '20px',
      paddingInline: '6px',
      borderRadius: '8px'
    },
    sm: {
      minHeight: '30px',
      minWidth: '100px',
      borderRadius: '12px'
    },
    md: {
      minHeight: '48px',
      minWidth: '120px',
      borderRadius: '16px'
    }
  },
  variants: {
    solid: {
      background: colors.primary,
      color: colors.invertedContrast,
      _hover: {
        background: colors.primary,
        opacity: '0.65'
      },
      _active: {
        opacity: 0.85,
        transform: `translateY(1px)`,
        background: colors.primary
      },
      '&:disabled:disabled': {
        opacity: '0.5',
        background: colors.backgroundDisabled,
        color: colors.textDisabled
      }
    },
    'solid-dark': {
      background: colors.backgroundDark,
      color: colors.textSecondary,
      _hover: {
        opacity: '0.65',
        background: colors.backgroundDark50
      },
      '&:disabled:disabled': {
        opacity: '0.5',
        background: colors.solidButtonBg
      }
    },
    capsule: {
      background: colors.backgroundTransparent12,
      color: colors.textTertiary,
      border: '1px solid transparent',
      borderRadius: '100px',
      minWidth: 'revert',
      minHeight: 'revert',
      _hover: {
        background: colors.backgroundTransparent07
      },
      _active: {
        borderColor: `var(--active-border-color, ${colors.selectActive})`,
        color: `var(--active-color, ${colors.textSecondary})`
      },
      '&:disabled:disabled': {
        opacity: '0.5',
        cursor: 'not-allowed'
      }
    },
    'capsule-radio': {
      bg: colors.backgroundTransparent12,
      color: colors.textSecondary,
      border: '1px solid transparent',
      borderRadius: '100px',
      minWidth: 'revert',
      minHeight: 'revert',
      _hover: {
        background: colors.backgroundTransparent07
      },
      _active: {
        borderColor: `var(--active-border-color, ${colors.selectActiveSecondary})`,
        color: `var(--active-color, ${colors.textPrimary})`,
        fontWeight: 500
      },
      '&:disabled:disabled': {
        opacity: '0.5',
        cursor: 'not-allowed'
      }
    },
    'rect-rounded-radio': {
      background: colors.backgroundTransparent12,
      color: colors.textTertiary,
      borderRadius: '4px',
      minWidth: 'revert',
      minHeight: 'revert',
      _hover: {
        background: colors.backgroundTransparent07
      },
      _active: {
        color: colors.textSecondary
      },
      '&:disabled:disabled': {
        opacity: '0.5',
        cursor: 'not-allowed'
      }
    },
    outline: {
      borderColor: colors.primary,
      color: colors.primary60,
      _hover: {
        opacity: '0.65'
      },
      _active: {
        filter: 'brightness(0.7)',
        opacity: '0.9'
      },
      '&:disabled:disabled': {
        opacity: '0.5'
      }
    },
    ghost: {
      color: colors.textSubtle,
      minWidth: 'revert',
      minHeight: 'revert',
      _hover: {
        opacity: '0.65',
        background: colors.outlineButtonBg
      },
      _active: {
        filter: 'brightness(0.7)',
        opacity: '0.9',
        background: colors.outlineButtonBg
      },
      '&:disabled:disabled': {
        opacity: '0.5'
      }
    },
    danger: {
      background: colors.failure,
      color: colors.buttonSolidText,
      _hover: {
        opacity: '0.65',
        background: colors.failure
      },
      _active: {
        filter: 'brightness(0.7)',
        opacity: '0.9',
        background: colors.failure
      },
      '&:disabled:disabled': {
        opacity: '0.5',
        background: colors.failure
      }
    },
    primary60: {
      border: 'none',
      borderBottom: '2px solid rgba(0, 0, 0, 0.10)',
      color: colors.primary60,
      bg: colors.tertiary,
      borderRadius: '8px',
      fontWeight: '600',
      _hover: {
        opacity: '0.7'
      },
      _active: {
        opacity: '0.9',
        borderBottom: '0'
      },
      '&:disabled:disabled': {
        opacity: '0.5'
      }
    }
  }
}
