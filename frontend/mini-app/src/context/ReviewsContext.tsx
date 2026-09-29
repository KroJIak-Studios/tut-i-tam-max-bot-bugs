import React, { useState, useEffect, useCallback } from 'react'
import type { PastEvent } from '../mocks/plansData'
import { getMyAttendances } from '../services/mapService'
import { submitEventReview } from '../services/eventService'
import { ReviewsContext, type UserReviewData } from './reviewsContextDef'

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Record<string, UserReviewData>>({})
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([])
  useEffect(() => { getMyAttendances('past').then((events) => setPastEvents(events.map((event) => ({ id: event.id, title: event.title, date: event.date, visitedDate: event.date, address: event.address || '', category: event.category, latitude: event.latitude, longitude: event.longitude, imageUrl: event.image })))).catch(() => setPastEvents([])) }, [])
  const submitReview = useCallback((id: string, rating: number, comment: string) => {
    submitEventReview(id, rating, comment)
      .then(() => {
        setReviews((prev) => ({ ...prev, [id]: { rating, comment, dateText: 'сегодня' } }))
      })
      .catch((err) => {
        console.error('Failed to submit review:', err)
      })
  }, [])
  const getReview = useCallback((id: string) => reviews[id], [reviews])
  return <ReviewsContext.Provider value={{ reviews, pastEvents, getReview, submitReview }}>{children}</ReviewsContext.Provider>
}
