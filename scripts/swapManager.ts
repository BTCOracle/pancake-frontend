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
        }
      }

      if (hasKeysToAdd) {
        // Read the file line by line
        const lines = fileContent.split('\n')

        // Find the last line with the closing brace
        let lastContentLineIdx = -1
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim() === '}') {
            lastContentLineIdx = i
            break
          }
        }

        if (lastContentLineIdx !== -1) {
          // Check if the line before the closing brace has a comma
          const lastKeyLineIdx = lastContentLineIdx - 1
          if (lastKeyLineIdx >= 0 && !lines[lastKeyLineIdx].trim().endsWith(',')) {
            lines[lastKeyLineIdx] += ','
          }

          // Add each new key before the closing brace
          const keyLines = Object.entries(keysToAdd).map(
            ([key, value], idx, arr) => `  "${key}": "${value}"${idx < arr.length - 1 ? ',' : ''}`,
          )

          // Insert the new key lines before the closing brace
          lines.splice(lastContentLineIdx, 0, ...keyLines)

          // Write the modified content back to the file
          fs.writeFileSync(filePath, lines.join('\n'))
          // eslint-disable-next-line no-console
          console.log(`Updated ${path.basename(filePath)}`)
        } else {
          console.error(`Could not find the closing brace in ${filePath}`)
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
  }
}

/**
 * Main function that handles CLI arguments and runs the translation management
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    // eslint-disable-next-line no-console
    console.log(`
Usage: 
  pnpm tsx scripts/translationManager.ts <keys_json_string> -tag <tag>

Examples:
  # Remove unused keys from translations file
  pnpm tsx scripts/translationManager.ts '{"key1":"key1","key2":"key2"}' -tag unused
  
  # Add missing keys to translations file
  pnpm tsx scripts/translationManager.ts '{"key3":"key3"}' -tag missing
    `)
    process.exit(1)
  }

  // Check for -tag argument
  const tagIndex = args.indexOf('-tag')
  if (tagIndex === -1 || tagIndex === args.length - 1) {
    console.error('Missing or invalid -tag parameter')
    process.exit(1)
  }

  const tagValue = args[tagIndex + 1]
  if (tagValue !== 'unused' && tagValue !== 'missing') {
    console.error('Tag must be either "unused" or "missing"')
    process.exit(1)
  }
  const tag = tagValue as Tag

  // Remove the -tag and its value from args for further processing
  const processArgs = [...args]
  processArgs.splice(tagIndex, 2)

  // Parse remaining arguments
  if (processArgs.length !== 1) {
    console.error('Invalid number of arguments')
    process.exit(1)
  }

  const keysString = processArgs[0]

  // Parse keys object
  let keysToProcess: TranslationKeys
  try {
    keysToProcess = JSON.parse(keysString)
  } catch (error) {
    console.error('Invalid JSON format for keys:', error)
    process.exit(1)
  }

  // Extract keys from the keys object
  const keys = Object.keys(keysToProcess)

  // Run the update
  await updateTranslationsFile(keysToProcess, [keys, tag])
}

// Run the script
main().catch(console.error)
