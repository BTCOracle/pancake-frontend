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
 * @param taggedKeys Array of tagged keys with format [["key1", "key2"], "unused"] or [["key3"], "missing"]
 */
async function updateTranslationsFile(keysToProcess: TranslationKeys, taggedKeys: TaggedKeys) {
  const [keys, tag] = taggedKeys
  processFile(TRANSLATIONS_FILE, keysToProcess, keys, tag)
}

/**
 * Process a translation file by adding missing keys or removing unused ones
 */
function processFile(filePath: string, keysToProcess: TranslationKeys, targetKeys: string[], tag: Tag) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const translations = JSON.parse(fileContent)
    let modified = false

    if (tag === 'unused') {
      // Remove keys tagged as unused
      for (const key of targetKeys) {
        if (key in translations) {
          delete translations[key]
          modified = true
          console.log(`Removed key "${key}" from ${path.basename(filePath)}`)
        }
      }

      if (modified) {
        // For removals, we need to rewrite the entire file
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2))
        // eslint-disable-next-line no-console
        console.log(`Updated ${path.basename(filePath)}`)
      }
    } else if (tag === 'missing') {
      // For missing keys, we'll manually append to the end of the file
      const keysToAdd: Record<string, string> = {}
      let hasKeysToAdd = false

      for (const key of targetKeys) {
        if (!(key in translations) && key in keysToProcess) {
          keysToAdd[key] = keysToProcess[key]
          hasKeysToAdd = true
          // eslint-disable-next-line no-console
          console.log(`Added key "${key}" to ${path.basename(filePath)}`)
