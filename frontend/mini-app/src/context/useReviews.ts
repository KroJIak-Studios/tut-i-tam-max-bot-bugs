import { useContext } from 'react'
import { ReviewsContext, type ReviewsContextValue } from './reviewsContextDef'

export function useReviews(): ReviewsContextValue {
  const context = useContext(ReviewsContext)
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider')
  }
  return context
}
