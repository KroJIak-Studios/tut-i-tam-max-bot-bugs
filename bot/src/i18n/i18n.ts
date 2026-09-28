import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export type TranslationKey = string
export type Dictionary = Record<string, unknown>

const localeDirectory = dirname(fileURLToPath(import.meta.url))

const canonicalizeLocale = (value: string): string =>
  value.trim().replace(/_/g, '-').split('-').map((part) => part.toLowerCase()).join('-')

const dictionaries = new Map<string, Dictionary>()

for (const filename of readdirSync(localeDirectory)) {
  if (!filename.endsWith('.json')) continue
  const locale = canonicalizeLocale(filename.slice(0, -'.json'.length))
  dictionaries.set(locale, JSON.parse(readFileSync(join(localeDirectory, filename), 'utf8')) as Dictionary)
}

if (dictionaries.size === 0) {
  throw new Error('At least one locale JSON file is required')
}

export const normalizeLocale = (value: string | null | undefined, fallback: string): string => {
  const normalizedFallback = canonicalizeLocale(fallback)
  const normalized = value ? canonicalizeLocale(value) : normalizedFallback

  if (dictionaries.has(normalized)) return normalized

  const language = normalized.split('-')[0]
  const languageMatch = [...dictionaries.keys()].find((locale) => locale.split('-')[0] === language)
  return languageMatch ?? normalizedFallback
}

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }
    return entities[character] ?? character
  })

export class I18n {
  private readonly dictionary: Dictionary

  constructor(locale: string | null | undefined, fallback: string) {
    const resolvedLocale = normalizeLocale(locale, fallback)
    const dictionary = dictionaries.get(resolvedLocale)

    if (!dictionary) {
      throw new Error(`Locale file is missing for fallback: ${fallback}`)
    }

    this.dictionary = dictionary
  }

  languageNames(): Record<string, string> {
    const names: Record<string, string> = {}
    for (const [locale, dictionary] of dictionaries) {
      const nativeName = dictionary.locale_name
      if (typeof nativeName === 'string') names[locale] = nativeName
    }
    return names
  }

  languageDisplayName(locale: string): string {
    const dictionary = dictionaries.get(normalizeLocale(locale, locale))
    const nativeName = typeof dictionary?.locale_name === 'string' ? dictionary.locale_name : locale
    const translatedNames = this.dictionary.language_names
    const translatedName = typeof translatedNames === 'object' && translatedNames !== null
      ? (translatedNames as Record<string, unknown>)[locale]
      : undefined
    const localName = typeof translatedName === 'string' ? translatedName : nativeName
    return `${localName} (${nativeName})`
  }

  translate(key: TranslationKey, variables: Record<string, string> = {}): string {
    const value = key.split('.').reduce<unknown>((current, segment) => {
      if (typeof current !== 'object' || current === null) return undefined
      return (current as Record<string, unknown>)[segment]
    }, this.dictionary)

    if (typeof value !== 'string') throw new Error(`Missing translation: ${key}`)
    return value.replace(/\{(\w+)\}/g, (_, name: string) => variables[name] ?? `{${name}}`)
  }
}
