import { useState } from 'react'
import styles from './EventPhoto.module.css'

interface EventPhotoProps {
  src?: string | null
  className?: string
  imageClassName?: string
}

export function EventPhoto({ src, className, imageClassName }: EventPhotoProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const pending = Boolean(src) && loadedSrc !== src && failedSrc !== src

  return (
    <span className={`${styles.frame} ${className ?? ''}`}>
      {pending ? <span className={styles.skeleton} aria-hidden="true" /> : null}
      {src && failedSrc !== src ? (
        <img
          src={src}
          alt=""
          className={`${styles.image} ${imageClassName ?? ''} ${loadedSrc === src ? styles.ready : ''}`}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
        />
      ) : null}
    </span>
  )
}
