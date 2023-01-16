import fs from 'fs'
import path from 'path'

// Define types
type TranslationKey = string
type TranslationKeys = Record<TranslationKey, TranslationKey>
type Tag = 'unused' | 'missing'
type TaggedKeys = [string[], Tag]

const TRANSLATIONS_FILE = path.resolve(__dirname, '../packages/localization/src/config/translations.json')

/**
 * Manages the translations.json file by adding missing keys or removing unused ones
 * @param keysToProcess Object containing keys in format { "key1": "key1", "key2": "key2" }
