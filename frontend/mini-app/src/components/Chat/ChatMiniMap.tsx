import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './ChatMiniMap.module.css'

interface ChatMiniMapProps {
  latitude: number
  longitude: number
  title: string
  onClick?: () => void
}

export const ChatMiniMap: React.FC<ChatMiniMapProps> = ({
  latitude,
  longitude,
  title,
  onClick,
}) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    const pinIcon = L.divIcon({
      className: 'tut-mini-pin-wrapper',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background: #2563EB;
          border: 2.5px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 3px 10px rgba(37, 99, 235, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: #FFFFFF; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })

    L.marker([latitude, longitude], { icon: pinIcon }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [latitude, longitude])

  return (
    <div
      ref={containerRef}
      className={styles.miniMap}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={t('catalog.showOnMap', { title })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <div className={styles.mapTapHint}>{t('chat.tapToOpenMap')}</div>
    </div>
  )
}
