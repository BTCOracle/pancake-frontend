import { I18nextProvider } from 'react-i18next'
import { createContext, useCallback, useEffect, useMemo } from 'react'
import i18n from './i18n'
import { EN, languages } from './config/languages'
import { LS_KEY } from './helpers'
import { ContextApi, Language, TranslateFunction } from './types'
import { useLocaleBundle } from './hooks/useLocaleBundle'
import { extendEnList } from './config/extendList'
import { LRU } from './lru'

export const LanguageContext = createContext<ContextApi | undefined>(undefined)

const cache = new LRU<string, string>({})

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { lang, bundle, ver, refresh, isFetching } = useLocaleBundle()

  // Ensure language sync immediately (avoids hydration mismatch)
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang)
  }

  // Still keep useEffect in case lang changes later
  useEffect(() => {
    const load = async () => {
      await i18n.changeLanguage(lang)
    }
    load()
  }, [lang])

  const setLanguage = useCallback(
    async (language: Language) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_KEY, language.locale)
      }
      await i18n.changeLanguage(language.locale)
      refresh()
    },
    [refresh],
  )

  const translate: TranslateFunction = useCallback(
    (key, data) => {
      if (isFetching) {
        return ''
      }
      const cacheKey = data ? `${lang}:${ver}:${key}-${JSON.stringify(data)}` : undefined

      if (cacheKey && cache.has(cacheKey)) {
        return cache.get(cacheKey) || ''
      }

      const value = bundle[key] || extendEnList[key] || key

      if (cacheKey) {
        const interpolated = value.replace(/%([a-zA-Z0-9-_]+)%/g, (match, p1) => {
          const replacement = data?.[p1]
          return replacement === undefined ? match : String(replacement)
        })
        cache.set(cacheKey, interpolated)
        return interpolated
      }

      return value
    },
    [bundle, lang, ver, isFetching],
  )

  const providerValue = useMemo(() => {
    const currentLanguage = languages[lang] || EN
    return { currentLanguage, setLanguage, t: translate, isFetching }
  }, [setLanguage, translate, lang, isFetching])

  if (isFetching) {
    return null
  }

  return (
    <I18nextProvider i18n={i18n} key={ver}>
      <LanguageContext.Provider value={providerValue}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  )
}
