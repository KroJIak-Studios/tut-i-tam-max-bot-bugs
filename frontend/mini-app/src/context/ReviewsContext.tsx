import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { INITIAL_PAST_EVENTS, type PastEvent } from '../mocks/plansData'
import { ReviewsContext, type UserReviewData } from './reviewsContextDef'

const STORAGE_KEY_REVIEWS = 'tut_i_tam_user_reviews'

const DEFAULT_REVIEWS: Record<string, UserReviewData> = {
  'past-architecture': {
    rating: 5,
    comment: 'Прекрасный лектор, очень интересно рассказал про купеческие дома.',
    dateText: '18 сентября',
  },
}

function loadSavedReviews(): Record<string, UserReviewData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS)
    if (raw) {
      return { ...DEFAULT_REVIEWS, ...JSON.parse(raw) }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_REVIEWS }
}

function persistReviews(reviews: Record<string, UserReviewData>): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews))
  } catch {
    // ignore
  }
}

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Record<string, UserReviewData>>(() => loadSavedReviews())

  useEffect(() => {
    persistReviews(reviews)
  }, [reviews])

  const submitReview = useCallback((eventId: string, rating: number, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [eventId]: {
        rating,
        comment,
        dateText: 'сегодня',
      },
    }))
  }, [])

  const getReview = useCallback(
    (eventId: string) => {
      return reviews[eventId]
    },
    [reviews]
  )

  const pastEvents: PastEvent[] = useMemo(() => {
    return INITIAL_PAST_EVENTS.map((evt) => {
      const userRev = reviews[evt.id]
      if (userRev) {
        return {
          ...evt,
          hasReview: true,
          rating: userRev.rating,
          reviewComment: userRev.comment,
        }
      }
      return evt
    })
  }, [reviews])

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        pastEvents,
        getReview,
        submitReview,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  )
}
