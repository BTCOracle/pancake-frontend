import { useColorMode } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { ThemeSwitcher } from '@pancakeswap/uikit'
import { useTheme } from 'next-themes'
import { useCallback } from 'react'
import { SettingField } from './SettingField'

export function ColorThemeSettingField() {
  const { t } = useTranslation()
  const { toggleColorMode } = useColorMode()
  const { setTheme, theme } = useTheme()
  const isDark = theme === 'dark'

  const handleToggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
    toggleColorMode()
  }, [isDark, setTheme, toggleColorMode])

  return (
    <SettingField fieldName={t('Color Theme')} renderToggleButton={<ThemeSwitcher isDark={isDark} toggleTheme={handleToggleTheme} />} />
  )
}
