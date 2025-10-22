import { useTranslation } from '@pancakeswap/localization'
import { Button, copyText, useToast } from '@pancakeswap/uikit'
import { OPTIONS, useElementToCanvas } from 'hooks/useElementToCanvas'
import { useCallback } from 'react'
import { generateClaimLink } from '../utils/generateClaimLink'

interface QRShareImageButtonProps {
  elementId: string
  code: string
}

const QRShareImageButton: React.FC<QRShareImageButtonProps> = ({ elementId, code }) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { convertToCanvasWithLoading, isLoading } = useElementToCanvas()

  const shareImage = useCallback(async () => {
    const claimLink = generateClaimLink({ code })

    function handleLinkFallback() {
      const shareText = t('Scan the QR code to claim your gift! %link%', { link: claimLink })

      if (navigator.share) {
        navigator
          .share({
            title: t('Gift from PancakeSwap!'),
            text: shareText,
            url: claimLink,
          })
          .catch(() => {
            copyText(claimLink)
            toastSuccess(t('Link copied'), t('Share link copied to clipboard!'))
          })
      } else {
        copyText(claimLink)
        toastSuccess(t('Link copied'), t('Share link copied to clipboard!'))
      }
    }

    const blob = await convertToCanvasWithLoading(elementId)

    if (blob) {
      const shareData = {
        title: t('Gift from PancakeSwap!'),
        text: t('Scan the QR code to claim your gift! Code: %code%', { code }),
        files: [new File([blob], `${OPTIONS.filename}.png`, { type: 'image/png' })],
      }

      // Check if Web Share API supports files
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData)
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            handleLinkFallback()
          }
        }
      } else {
        handleLinkFallback()
      }
    } else {
      handleLinkFallback()
    }
  }, [elementId, code, t])

  return (
    <Button onClick={shareImage} variant="secondary" width="100%" disabled={isLoading} isLoading={isLoading}>
      {isLoading ? t('Sharing...') : t('Share')}
    </Button>
  )
}

export default QRShareImageButton
