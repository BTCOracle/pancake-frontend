import { useEffect, useState } from 'react'

export function useInputObserver(selector: string) {
  const [inputValue, setInputValue] = useState<string | undefined>(undefined)

  useEffect(() => {
    let input: HTMLInputElement | null = null
    let valueObserver: MutationObserver | null = null
    let inputListener: ((e: Event) => void) | null = null

    const attach = (el: HTMLInputElement) => {
      input = el

      const updateValue = () => setInputValue(el.value)

      inputListener = () => updateValue()
      el.addEventListener('input', inputListener)

      valueObserver = new MutationObserver(() => updateValue())
      valueObserver.observe(el, {
        attributes: true,
        attributeFilter: ['value'],
      })

      updateValue()
    }

    const detach = () => {
      if (input && inputListener) {
        input.removeEventListener('input', inputListener)
      }
      valueObserver?.disconnect()
      input = null
    }

    const findAndAttachInput = () => {
      const el = document.querySelector(selector)
      if (el instanceof HTMLInputElement) {
        detach()
        attach(el)
      }
    }

    const domObserver = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el instanceof HTMLInputElement) {
        if (el !== input) {
          attach(el)
        }
      } else if (input) {
        detach()
        setInputValue(undefined)
      }
    })

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    findAndAttachInput()

    return () => {
      detach()
      domObserver.disconnect()
    }
  }, [selector])

  return inputValue
}
