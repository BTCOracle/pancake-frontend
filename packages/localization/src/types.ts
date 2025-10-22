export type ContextData = {
  [key: string]: string | number | undefined
}

export interface ProviderState {
  isFetching: boolean
  currentLanguage: Language
}

export interface ContextApi extends ProviderState {
  setLanguage: (language: Language) => void
  t: TranslateFunction
}

// To support string literals and union of string
// https://stackoverflow.com/questions/61047551/typescript-union-of-string-and-string-literals
type MaybeObject = Record<never, never>

export type TranslateFunction = (key: string, data?: ContextData) => string

export interface Language {
  code: string
  language: string
  locale: string
}
