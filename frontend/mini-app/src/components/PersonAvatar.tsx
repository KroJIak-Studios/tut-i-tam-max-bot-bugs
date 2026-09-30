import { useState } from 'react'
import styles from './PersonAvatar.module.css'

interface PersonAvatarProps {
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
  className?: string
}

export function personInitials(firstName?: string | null, lastName?: string | null): string {
  const letters = [firstName, lastName]
    .map((part) => part?.trim().charAt(0).toLocaleUpperCase())
    .filter(Boolean)
  return letters.join('')
}

export function PersonAvatar({ firstName, lastName, imageUrl, className }: PersonAvatarProps) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const initials = personInitials(firstName, lastName)
  const imageReady = Boolean(imageUrl) && loadedUrl === imageUrl

  return (
    <span className={`${styles.avatar} ${className ?? ''}`}>
      {imageReady ? null : <span className={styles.initials} aria-hidden="true">{initials}</span>}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className={`${styles.image} ${imageReady ? styles.imageReady : ''}`}
          onLoad={() => setLoadedUrl(imageUrl)}
          onError={() => setLoadedUrl(null)}
        />
      ) : null}
    </span>
  )
}