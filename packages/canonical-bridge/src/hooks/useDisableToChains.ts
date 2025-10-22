import { useEffect } from 'react'
import { chains } from '../configs'

export function useDisableToChains(disabledToChainIds?: number[]) {
  useEffect(() => {
    if (!disabledToChainIds || disabledToChainIds.length === 0) return undefined

    const chainNamesToDisable = disabledToChainIds
      .map((id) => chains.find((c) => c.id === id)?.name?.toLowerCase())
      .filter(Boolean) as string[]

    const hideToChains = () => {
      const items = document.querySelectorAll('.bccb-widget-to-network-virtual-list .bccb-widget-to-network-list-item')
      items.forEach((item) => {
        const nameElement = item.querySelector('p.chakra-text')
        const name = nameElement?.textContent?.toLowerCase()
        if (name && chainNamesToDisable.includes(name)) {
          item.remove()
        }
      })
    }

    const disableExchangeIconIfNeeded = () => {
      const exchangeIcon = document.querySelector('.bccb-widget-exchange-chain-icon') as HTMLElement | null

      if (exchangeIcon) {
        const fromChainElement = document.querySelector(
          '.bccb-widget-network-from .bccb-widget-network-button p.chakra-text',
        )
        const fromChainName = fromChainElement?.textContent?.toLowerCase()

        if (fromChainName && chainNamesToDisable.includes(fromChainName)) {
          exchangeIcon.style.pointerEvents = 'none'
          exchangeIcon.style.opacity = '0.4'
          exchangeIcon.style.cursor = 'not-allowed'
        } else {
          exchangeIcon.style.pointerEvents = ''
          exchangeIcon.style.opacity = ''
          exchangeIcon.style.cursor = ''
        }
      }
    }

    hideToChains()
    disableExchangeIconIfNeeded()

    const observer = new MutationObserver(() => {
      hideToChains()
      disableExchangeIconIfNeeded()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [disabledToChainIds])
}
