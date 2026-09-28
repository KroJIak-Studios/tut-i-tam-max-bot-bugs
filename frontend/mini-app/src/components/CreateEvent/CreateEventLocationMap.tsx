import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { EventLocationMode, EventGeoPoint, EventGeoArea } from './types'
import { IconLocationPin, IconPolygon, IconUndo } from '../Icons'
import styles from './CreateEventLocationMap.module.css'

const DEFAULT_CENTER: [number, number] = [55.7960, 49.1140] // Kazan center

interface CreateEventLocationMapProps {
  mode: EventLocationMode
  point?: EventGeoPoint
  area?: EventGeoArea
  onModeChange: (mode: EventLocationMode) => void
  onPointChange: (point: EventGeoPoint) => void
  onAreaChange: (area: EventGeoArea) => void
  error?: string
}

export const CreateEventLocationMap: React.FC<CreateEventLocationMapProps> = ({
  mode,
  point,
  area,
  onModeChange,
  onPointChange,
  onAreaChange,
  error,
}) => {
  const { t } = useTranslation()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const pointLayerRef = useRef<L.LayerGroup | null>(null)
  const areaLayerRef = useRef<L.LayerGroup | null>(null)

  // Keep latest props in refs for map event listeners to avoid stale closures
  const modeRef = useRef(mode)
  const pointRef = useRef(point)
  const areaRef = useRef(area)
  const onPointChangeRef = useRef(onPointChange)
  const onAreaChangeRef = useRef(onAreaChange)

  useEffect(() => {
    modeRef.current = mode
    pointRef.current = point
    areaRef.current = area
    onPointChangeRef.current = onPointChange
    onAreaChangeRef.current = onAreaChange
  })

  const initialCenterRef = useRef<[number, number]>(
    point ? [point.lat, point.lng] : DEFAULT_CENTER
  )

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const initialCenter = initialCenterRef.current

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false, // Prevent page scrolling hijacking
      touchZoom: true,
      dragging: true,
      doubleClickZoom: true,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    const pointLayer = L.layerGroup().addTo(map)
    const areaLayer = L.layerGroup().addTo(map)
    pointLayerRef.current = pointLayer
    areaLayerRef.current = areaLayer
    mapRef.current = map

    // Click handler on map
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(5))
      const lng = Number(e.latlng.lng.toFixed(5))

      if (modeRef.current === 'point') {
        pointRef.current = { lat, lng }
        onPointChangeRef.current({ lat, lng })
      } else {
        const currentPoints = areaRef.current?.points || []
        const nextPoints = [...currentPoints, { lat, lng }]
        areaRef.current = { points: nextPoints }
        onAreaChangeRef.current({
          points: nextPoints,
        })
      }
    })

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
      pointLayerRef.current = null
      areaLayerRef.current = null
    }
  }, []) // Mount once

  // Invalidate map size when mode changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize()
      }, 50)
    }
  }, [mode])

  // Update Layers based on mode, point, and area
  useEffect(() => {
    const pointLayer = pointLayerRef.current
    const areaLayer = areaLayerRef.current
    if (!pointLayer || !areaLayer) return

    pointLayer.clearLayers()
    areaLayer.clearLayers()

    if (mode === 'point') {
      const activePoint = point || { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }
      const pinIcon = L.divIcon({
        className: 'tut-location-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #2563EB;
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="width: 8px; height: 8px; background: #FFFFFF; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      L.marker([activePoint.lat, activePoint.lng], { icon: pinIcon }).addTo(pointLayer)
    } else {
      const points = area?.points || []
      const latlngs: [number, number][] = points.map((p) => [p.lat, p.lng])

      // Render vertices
      points.forEach((p, idx) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 6,
          color: '#2563EB',
          fillColor: '#FFFFFF',
          fillOpacity: 1,
          weight: 2.5,
        })
        marker.bindTooltip(`${idx + 1}`, { permanent: false, direction: 'top' })
        marker.addTo(areaLayer)
      })

      // Render polygon or polyline
      if (latlngs.length >= 3) {
        L.polygon(latlngs, {
          color: '#2563EB',
          fillColor: '#3B82F6',
          fillOpacity: 0.3,
          weight: 2.5,
        }).addTo(areaLayer)
      } else if (latlngs.length === 2) {
        L.polyline(latlngs, {
          color: '#2563EB',
          weight: 2.5,
          dashArray: '6, 6',
        }).addTo(areaLayer)
      }
    }
  }, [mode, point, area])

  const areaPointsCount = area?.points?.length || 0
  const isAreaValid = areaPointsCount >= 3

  const handleUndoPoint = () => {
    const currentPoints = area?.points || []
    if (currentPoints.length > 0) {
      const nextPoints = currentPoints.slice(0, -1)
      areaRef.current = { points: nextPoints }
      onAreaChange({ points: nextPoints })
    }
  }

  const handleClearPoints = () => {
    areaRef.current = { points: [] }
    onAreaChange({ points: [] })
  }

  const currentCoordsText = point
    ? `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`
    : `${DEFAULT_CENTER[0].toFixed(4)}, ${DEFAULT_CENTER[1].toFixed(4)}`

  return (
    <div className={styles.container}>
      {/* Mode Switcher */}
      <div className={styles.modeHeader}>
        <span className={styles.modeLabel}>{t('createEvent.fields.locationModeLabel')}</span>
      </div>

      <div
        className={styles.modeSelector}
        role="radiogroup"
        aria-label={t('createEvent.fields.locationModeLabel')}
      >
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'point'}
          className={`${styles.modeBtn} ${mode === 'point' ? styles.modeBtnActive : ''}`}
          onClick={() => onModeChange('point')}
        >
          <IconLocationPin size={16} />
          <span>{t('createEvent.fields.pointMode')}</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'area'}
          className={`${styles.modeBtn} ${mode === 'area' ? styles.modeBtnActive : ''}`}
          onClick={() => onModeChange('area')}
        >
          <IconPolygon size={16} />
          <span>{t('createEvent.fields.areaMode')}</span>
        </button>
      </div>

      {/* Helper text / Status row */}
      <div className={styles.helperRow}>
        <span className={styles.helperText}>
          {mode === 'point'
            ? t('createEvent.fields.pointHelper')
            : t('createEvent.fields.areaHelper')}
        </span>
        {mode === 'point' && (
          <span className={styles.coordsBadge}>{currentCoordsText}</span>
        )}
      </div>

      {/* Map Container */}
      <div className={`${styles.mapWrapper} ${error ? styles.mapWrapperHasError : ''}`}>
        <div ref={mapContainerRef} className={styles.map} />
      </div>

      {/* Area Controls */}
      {mode === 'area' && (
        <div className={styles.areaBar}>
          <span
            className={`${styles.pointsBadge} ${isAreaValid ? styles.pointsBadgeValid : ''}`}
          >
            {t('createEvent.fields.pointsCount', { count: areaPointsCount })}
            {areaPointsCount < 3 ? ` (${t('createEvent.fields.minPointsBadge')})` : ' ✓'}
          </span>

          <div className={styles.areaActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleUndoPoint}
              disabled={areaPointsCount === 0}
              aria-label={t('createEvent.fields.undoPoint')}
            >
              <IconUndo size={14} />
              <span>{t('createEvent.fields.undoPoint')}</span>
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleClearPoints}
              disabled={areaPointsCount === 0}
              aria-label={t('createEvent.fields.clearPoints')}
            >
              <span>{t('createEvent.fields.clearPoints')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={styles.errorMsg} role="alert">
          {t(error)}
        </div>
      )}
    </div>
  )
}
