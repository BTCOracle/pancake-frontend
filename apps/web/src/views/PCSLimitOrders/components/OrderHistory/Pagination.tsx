import { Box, BoxProps, PaginationButton } from '@pancakeswap/uikit'
import { useCallback, useEffect } from 'react'
import { useUserLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'

export const Pagination = (props: BoxProps) => {
  const { canGoBack, canGoForward, nextPage, previousPage, currentPage, isLoading } = useUserLimitOrders()

  const setCurrentPage = useCallback(
    (page: number) => {
      if (isLoading) return
      if (page > currentPage && canGoForward) {
        nextPage()
      } else if (page < currentPage && canGoBack) {
        previousPage()
      }
    },
    [currentPage, canGoBack, canGoForward, nextPage, previousPage, isLoading],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isLoading) return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          if (canGoBack) {
            previousPage()
          }
          break
        case 'ArrowRight':
          event.preventDefault()
          if (canGoForward) {
            nextPage()
          }
          break
        default:
          break
      }
    },
    [canGoBack, canGoForward, nextPage, previousPage, isLoading],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <Box background="backgroundAlt" {...props}>
      <PaginationButton
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        maxPage={!canGoForward ? currentPage : undefined}
      />
    </Box>
  )
}
