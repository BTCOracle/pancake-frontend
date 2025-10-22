import { useTheme } from '@pancakeswap/hooks'
import html2canvas from 'html2canvas'
import { useCallback, useMemo, useState } from 'react'

export const OPTIONS = {
  scale: 2,
  filename: 'pancake-gift',
}

async function convertToCanvas(elementId: string, isDark: boolean): Promise<Blob | null> {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with id "${elementId}" not found`)
    return null
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: isDark ? '#27262d' : 'white',
      scale: OPTIONS.scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    })
  } catch (error) {
    console.error('Failed to capture element:', error)
    return null
  }
}

export const useElementToCanvas = () => {
  const [isLoading, setIsLoading] = useState(false)
  const theme = useTheme()

  const convertToCanvasWithLoading = useCallback(
    async (elementId: string): Promise<Blob | null> => {
      if (isLoading) {
        return null
      }

      try {
        setIsLoading(true)

        const blob = await convertToCanvas(elementId, theme.isDark)
        return blob
      } catch (error) {
        console.error('Failed to capture element:', error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, theme.isDark],
  )

  return useMemo(
    () => ({
      convertToCanvasWithLoading,
      isLoading,
    }),
    [convertToCanvasWithLoading, isLoading],
  )
}
