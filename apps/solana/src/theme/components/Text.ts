import { colors } from '../cssVariables'

export const Text = {
  variants: {
    dialogTitle: {
      fontSize: '20px',
      fontWeight: 500,
      color: colors.textPrimary
    },
    title: {
      fontSize: 'lg',
      fontWeight: 600,
      color: colors.textSecondary
    },
    subTitle: {
      fontSize: 'sm',
      fontWeight: 600,
      color: colors.textSecondary
    },
    label: {
      fontSize: 'xs',
      color: colors.textSubtle
    },
    error: {
      fontSize: 'sm',
      fontWeight: 400,
      color: colors.textPink
    }
  }
}
