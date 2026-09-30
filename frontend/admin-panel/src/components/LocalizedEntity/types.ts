/**
 * Shared types for localized entity list (Categories, Interests).
 * Keeps only the structural contract — domain-specific logic stays in each feature.
 */

export interface LocaleName {
  locale_code: string
  text: string
}

export interface LocaleItem {
  code: string
  native_name: string
}

export interface LocalizedEntity {
  id: number
  names: LocaleName[]
}

export interface LocalizedEntityListProps<T extends LocalizedEntity> {
  items: T[]
  locales: LocaleItem[]
  fallbackLocaleCode: string
  searchQuery: string
  onSearchChange: (q: string) => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onCreateClick: () => void
  entityLabel: string
  /** Reads the backend aggregate; null or undefined means unavailable. */
  getCount?: (item: T) => number | null | undefined
  /** Column header label, e.g. "Мероприятий" or "Пользователей" */
  countLabel?: string
  createButtonLabel: string
  emptyTitle: string
  emptyText: string
}
