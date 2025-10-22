import { useTranslation } from '@pancakeswap/localization'
import { Button, copyText, useToast } from '@pancakeswap/uikit'
import { useCallback } from 'react'

interface ShareGiftLinkButtonProps {
  text: string
  claimLink: string
}

export const ShareGiftLinkButton: React.FC<ShareGiftLinkButtonProps> = ({ text, claimLink }) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()

  const handleShare = useCallback(async () => {
    const shareData = {
      title: t('Gift from PancakeSwap!'),
      text,
    }

    // Check if native share is available
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData)
        // No need to show toast for native share as it's handled by the OS
      } catch (error) {
        // User cancelled the share or an error occurred
        // Fall back to copying to clipboard
        if (error instanceof Error && error.name !== 'AbortError') {
          copyText(claimLink)
          toastSuccess(t('Link copied'), t('Share link copied to clipboard!'))
        }
      }
    } else {
      // Fallback to copying to clipboard
      toastSuccess(t('Link copied'), t('Share link copied to clipboard!'))
    }
  }, [claimLink, t, toastSuccess])

  return (
    <Button variant="secondary" width="100%" onClick={handleShare}>
      {t('Share')}
    </Button>
  )
}
