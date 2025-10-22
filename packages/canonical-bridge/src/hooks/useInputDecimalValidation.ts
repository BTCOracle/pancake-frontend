import { useEffect } from 'react'

export function useInputDecimalValidation() {
  useEffect(() => {
    if (typeof document !== 'undefined' && document) {
      const inputElement = document.querySelector('.bccb-widget-transfer-input') as HTMLInputElement | null
      if (inputElement) {
        inputElement.setAttribute('pattern', '^[0-9]*[.,]?[0-9]*$')

        const handlePaste = (e: ClipboardEvent) => {
          const pastedValue = e?.clipboardData?.getData('Text')

          if (!pastedValue || !/^[0-9]*[.,]?[0-9]*$/.test(pastedValue)) {
            e.preventDefault()
          }
        }

        inputElement.addEventListener('paste', handlePaste)

        return () => {
          inputElement.removeEventListener('paste', handlePaste)
        }
      }
    }
    return undefined
  }, [])

  return null
}
