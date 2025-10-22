import { useMatchBreakpoints } from '@pancakeswap/uikit'
import debounce from 'lodash/debounce'
import { useCallback, useEffect, useRef, useState } from 'react'

type Direction = 'up' | 'down'

const snapScrollCreator = () => {
  let snapLock: boolean = false
  function useScrollToNearestSnap(snapClassName: string) {
    const prevScrollY = useRef(window.scrollY)
    const { isMobile } = useMatchBreakpoints()

    const [sightPosition, updateSitePosition] = useState(window.innerHeight * 0.1)

    useEffect(() => {
      const handleResize = () => {
        updateSitePosition(window.innerHeight * 0.1)
      }
      document.addEventListener('resize', handleResize)
      return () => {
        document.removeEventListener('resize', handleResize)
      }
    }, [])

    const scrollToNearestSnap = useCallback(
      debounce(() => {
        const currentScrollY = window.scrollY
        const scrollDelta = currentScrollY - prevScrollY.current

        if (Math.abs(scrollDelta) < 20) return
        const snapped = snapToNext(scrollDelta > 0 ? 'down' : 'up', snapClassName, sightPosition)
        if (snapped) {
          setTimeout(() => {
            prevScrollY.current = window.scrollY
          }, 1000)
        }
        prevScrollY.current = currentScrollY
      }, 50),
      [snapClassName, sightPosition],
    )

    useEffect(() => {
      if (isMobile) {
        return () => {}
      }
      window.addEventListener('scroll', scrollToNearestSnap, { passive: true })
      return () => window.removeEventListener('scroll', scrollToNearestSnap)
    }, [scrollToNearestSnap, isMobile])
  }

  function smoothScrollTo(targetPosition: number, duration = 150) {
    const startPosition = window.scrollY
    const distance = targetPosition - startPosition
    const startTime = performance.now()

    function scroll(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      window.scrollTo(0, startPosition + distance * easeInOutCubic(progress))
      if (progress < 1) {
        requestAnimationFrame(scroll)
      }
    }

    requestAnimationFrame(scroll)
  }

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
  }

  function snapToNext(direction: Direction, snapClassName: string, sightPosition: number) {
    if (snapLock) return false
    const snapElements = Array.from(document.querySelectorAll(`.${snapClassName}`)) as HTMLElement[]
    if (snapElements.length === 0) return false

    const currentScrollY = window.scrollY
    const viewPos = currentScrollY + sightPosition

    let nearestElement: HTMLElement | null = null
    let nearestDistance = Infinity

    snapElements.forEach((el) => {
      const snapPos = el.offsetTop - sightPosition
      const isDown = direction === 'down'
      const distance = isDown ? snapPos - viewPos : viewPos - snapPos

      if (distance > 0 && distance < nearestDistance) {
        nearestDistance = distance
        nearestElement = el as HTMLElement
      }
    })

    if (nearestElement) {
      const el = nearestElement as HTMLElement
      snapLock = true
      smoothScrollTo(el.offsetTop - sightPosition)
      setTimeout(() => {
        snapLock = false
      }, 1000)
      return true
    }
    return false
  }

  return {
    useScrollToNearestSnap,
    snapToNext,
  }
}

const snapUtils = snapScrollCreator()
export const { useScrollToNearestSnap, snapToNext } = snapUtils
