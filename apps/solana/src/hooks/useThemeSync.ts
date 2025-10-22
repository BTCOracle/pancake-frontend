import { useColorMode } from '@chakra-ui/react'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

const useThemeSync = () => {
  const { resolvedTheme } = useTheme()
  const { colorMode, setColorMode } = useColorMode()

  useEffect(() => {
    if (colorMode !== resolvedTheme) {
      setColorMode(resolvedTheme)
    }
  }, [colorMode, resolvedTheme, setColorMode])
}

export default useThemeSync
