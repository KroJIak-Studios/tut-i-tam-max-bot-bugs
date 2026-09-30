import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapPin, X, Info } from 'lucide-react'
import styles from './CityMapPicker.module.css'

interface CityMapPickerProps {
  latitude: number | null
  longitude: number | null
  onChange: (lat: number | null, lng: number | null) => void
  readOnly?: boolean
}

const PIN_ICON_HTML = `
  <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 40 16 40S32 28 32 16C32 7.163 24.837 0 16 0Z" fill="#2563EB"/>
    <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
  </svg>
`

export const CityMapPicker: React.FC<CityMapPickerProps> = ({
  latitude,
  longitude,
  onChange,
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  const initialCenterRef = useRef<[number, number]>(
    latitude != null && longitude != null
      ? [latitude, longitude]
      : [55.7558, 37.6173], // Moscow default center
  )
  const initialZoomRef = useRef<number>(
    latitude != null && longitude != null ? 10 : 4,
  )

  const onChangeRef = useRef(onChange)
  const readOnlyRef = useRef(readOnly)

  useEffect(() => {
    onChangeRef.current = onChange
    readOnlyRef.current = readOnly
  }, [onChange, readOnly])

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: true,
    })

    // Remove Leaflet branding, keep mandatory OpenStreetMap attribution
    map.attributionControl.setPrefix('')
    map.getContainer().addEventListener('wheel', (event) => event.stopPropagation())

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (readOnlyRef.current) return
      const lat = parseFloat(e.latlng.lat.toFixed(5))
      const lng = parseFloat(e.latlng.lng.toFixed(5))
      onChangeRef.current(lat, lng)
    })

    mapRef.current = map

    // Ensure map layout is correct after render
    const resizeTimer = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(containerRef.current)

    return () => {
      clearTimeout(resizeTimer)
      observer.disconnect()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, []) // intentionally runs once on mount

  // Sync marker with latitude and longitude props
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (latitude != null && longitude != null) {
      const pinIcon = L.divIcon({
        className: 'custom-city-pin',
        html: PIN_ICON_HTML,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -36],
      })

      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude])
      } else {
        const marker = L.marker([latitude, longitude], {
          icon: pinIcon,
          interactive: !readOnly,
        }).addTo(map)
        markerRef.current = marker
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [latitude, longitude, readOnly])

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange(null, null)
  }

  const hasCoords = latitude != null && longitude != null

  return (
    <div className={styles.container}>
      <div className={styles.mapHeader}>
        {hasCoords ? (
          <div className={styles.coordsBadge}>
            <MapPin size={14} />
            <span>
              {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
            </span>
          </div>
        ) : (
          <div className={styles.hint}>
            <Info size={14} />
            <span>Тапните или кликните по карте, чтобы задать точку центра</span>
          </div>
        )}

        {hasCoords && !readOnly && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            title="Очистить координаты"
          >
            <X size={14} />
            <span>Сбросить</span>
          </button>
        )}
      </div>

      <div className={styles.mapWrapper}>
        <div ref={containerRef} className={styles.mapContainer} />
      </div>
    </div>
  )
}
