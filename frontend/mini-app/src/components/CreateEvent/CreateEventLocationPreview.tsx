import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { EventLocationMode, EventGeoPoint, EventGeoArea } from './types'
import styles from './CreateEventLocationPreview.module.css'

const DEFAULT_CENTER: [number, number] = [55.7960, 49.1140]

interface CreateEventLocationPreviewProps {
  mode: EventLocationMode
  point?: EventGeoPoint
  area?: EventGeoArea
  height?: number
  className?: string
}

export const CreateEventLocationPreview: React.FC<CreateEventLocationPreviewProps> = ({
  mode,
  point,
  area,
  height,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const initialCenter = point
      ? [point.lat, point.lng] as [number, number]
      : DEFAULT_CENTER

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 14,
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

    if (mode === 'point') {
      const activePoint = point || { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }
      const pinIcon = L.divIcon({
        className: 'tut-location-preview-pin',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            background: #2563EB;
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 7px; height: 7px; background: #FFFFFF; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      })
      L.marker([activePoint.lat, activePoint.lng], { icon: pinIcon }).addTo(map)
      map.setView([activePoint.lat, activePoint.lng], 15)
    } else {
      const points = area?.points || []
      const latlngs: [number, number][] = points.map((p) => [p.lat, p.lng])

      if (latlngs.length >= 3) {
        const polygon = L.polygon(latlngs, {
          color: '#2563EB',
          fillColor: '#3B82F6',
          fillOpacity: 0.3,
          weight: 2.5,
        }).addTo(map)

        points.forEach((p) => {
          L.circleMarker([p.lat, p.lng], {
            radius: 4,
            color: '#2563EB',
            fillColor: '#FFFFFF',
            fillOpacity: 1,
            weight: 2,
          }).addTo(map)
        })

        try {
          map.fitBounds(polygon.getBounds(), { padding: [16, 16], maxZoom: 16 })
        } catch {
          // ignore if bounds calculation fails
        }
      } else if (latlngs.length > 0) {
        latlngs.forEach((coord) => {
          L.circleMarker(coord, {
            radius: 5,
            color: '#2563EB',
            fillColor: '#FFFFFF',
            fillOpacity: 1,
            weight: 2,
          }).addTo(map)
        })
        map.setView(latlngs[0], 14)
      }
    }

    mapRef.current = map

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
    }
  }, [mode, point, area])

  return (
    <div
      className={`${styles.previewWrapper} ${className || ''}`}
      style={height ? { height: `${height}px` } : undefined}
    >
      <div
        ref={containerRef}
        className={styles.map}
        style={height ? { height: `${height}px` } : undefined}
      />
    </div>
  )
}
