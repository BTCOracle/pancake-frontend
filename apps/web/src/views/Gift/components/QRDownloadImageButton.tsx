import { useTranslation } from '@pancakeswap/localization'
import { Button } from '@pancakeswap/uikit'
import { OPTIONS, useElementToCanvas } from 'hooks/useElementToCanvas'
import { useCallback } from 'react'

interface QRDownloadImageButtonProps {
  elementId: string
  filename?: string
}

const QRDownloadImageButton: React.FC<QRDownloadImageButtonProps> = ({ elementId }) => {
  const { t } = useTranslation()
  const { convertToCanvasWithLoading, isLoading } = useElementToCanvas()

  const downloadImage = useCallback(async () => {
    const blob = await convertToCanvasWithLoading(elementId)
    if (blob) {
      const link = document.createElement('a')
      link.download = `${OPTIONS.filename}.png`
      link.href = URL.createObjectURL(blob)
      link.click()
      URL.revokeObjectURL(link.href)
    }
  }, [elementId])

  return (
    <Button
      onClick={() => !isLoading && downloadImage()}
      variant="danger"
      width="100%"
      disabled={isLoading}
      isLoading={isLoading}
    >
      {isLoading ? t('Downloading...') : t('Download')}
    </Button>
  )
}

export default QRDownloadImageButton
