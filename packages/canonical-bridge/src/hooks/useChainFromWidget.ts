import { useEffect, useState } from 'react'

export function useChainFromWidget(direction: 'from' | 'to') {
  const [chain, setChain] = useState<string | null>('')

  useEffect(() => {
    const findText = () => {
      const container = document.querySelector(`.bccb-widget-network-${direction} .bccb-widget-network-name`)
      if (container) {
        const pElement = container.querySelector('p.chakra-text')
        if (pElement) {
          setChain(pElement.textContent)
        }
      }
    }

    findText()

    const observer = new MutationObserver(findText)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [direction])

  return chain?.toLowerCase()
}
