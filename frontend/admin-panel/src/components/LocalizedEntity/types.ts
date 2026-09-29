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
  /** Optional: additional count metric to display (e.g. events_count, users_count) */
  count?: number | null
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
  /** Label for the count column, e.g. "Мероприятий" or "Пользователей" */
  countLabel?: string
  createButtonLabel: string
  emptyTitle: string
  emptyText: string
}
