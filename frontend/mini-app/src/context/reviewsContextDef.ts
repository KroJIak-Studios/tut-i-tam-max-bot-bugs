import { createContext } from 'react'
import type { PastEvent } from '../mocks/plansData'

export interface UserReviewData {
  rating: number
  comment: string
  dateText?: string
}

export interface ReviewsContextValue {
  reviews: Record<string, UserReviewData>
  pastEvents: PastEvent[]
  getReview: (eventId: string) => UserReviewData | undefined
  submitReview: (eventId: string, rating: number, comment: string) => void
}

export const ReviewsContext = createContext<ReviewsContextValue | null>(null)
