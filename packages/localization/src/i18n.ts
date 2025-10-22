import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { EN } from './config/languages'
import { extendEnList } from './config/extendList'

const resources = {
  [EN.locale]: {
    translation: extendEnList,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: EN.locale,
  fallbackLng: EN.locale,
  interpolation: {
    escapeValue: false,
    prefix: '%',
    suffix: '%',
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
