import { useCallback, useEffect, useState } from 'react'
import { fetchLocale, getLanguageCodeFromLS } from '../helpers'
import i18n from '../i18n'
import { extendEnList } from '../config/extendList'

export const useLocaleBundle = () => {
  const lang = getLanguageCodeFromLS()
  const [state, setState] = useState<{
    language: string
    bundle: Record<string, string>
    ver: number
    isFetching: boolean
  }>(() => ({
    language: lang,
    bundle: extendEnList,
    ver: 0,
    isFetching: !i18n.hasResourceBundle(lang, 'translation'),
  }))
  const switchBundle = useCallback(async (lang: string) => {
    if (!i18n.hasResourceBundle(lang, 'translation')) {
      setState((prev) => ({ ...prev, isFetching: true }))
      const localeData = await fetchLocale(lang)
      if (localeData) {
        i18n.addResourceBundle(lang, 'translation', localeData, true, true)
        setState((prev) => ({
          language: lang,
          bundle: localeData,
          ver: prev.ver + 1,
          isFetching: false,
        }))
        return
      }
    }
    setState((prev) => ({
      language: lang,
      bundle: i18n.getResourceBundle(lang, 'translation') || extendEnList,
      ver: prev.ver + 1,
      isFetching: false,
    }))
  }, [])

  useEffect(() => {
    switchBundle(lang)
  }, [lang, switchBundle])

  const { language, bundle, ver, isFetching } = state
  return {
    lang: language,
    bundle,
    ver,
    isFetching,
    refresh: useCallback(() => setState((p) => ({ ...p, ver: p.ver + 1 })), []),
  }
}
