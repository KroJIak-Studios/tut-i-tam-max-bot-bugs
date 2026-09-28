import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { GeoPoint, GeoArea, LocationMode } from '../../types/request'
import { IconMapPin, IconPolygon } from '../Icons'
import styles from './RequestLocationMap.module.css'

interface RequestLocationMapProps {
  locationMode: LocationMode
  locationPoint?: GeoPoint
  locationArea?: GeoArea
  address: string
}

export const RequestLocationMap: React.FC<RequestLocationMapProps> = ({
  locationMode,
  locationPoint,
  locationArea,
  address,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const initialCenterRef = useRef<[number, number]>(
    locationPoint
      ? [locationPoint.lat, locationPoint.lng]
      : locationArea && locationArea.points.length > 0
        ? [locationArea.points[0].lat, locationArea.points[0].lng]
        : [55.796, 49.114],
  )

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: initialCenterRef.current,
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    const layerGroup = L.layerGroup().addTo(map)
    layerGroupRef.current = layerGroup
    mapRef.current = map

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
      layerGroupRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layerGroup = layerGroupRef.current
    if (!map || !layerGroup) return

    layerGroup.clearLayers()

    if (locationMode === 'point' && locationPoint) {
      const pinIcon = L.divIcon({
        className: 'custom-point-pin',
        html: `
          <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 42 17 42S34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="#2563EB"/>
            <circle cx="17" cy="17" r="7" fill="#FFFFFF"/>
          </svg>
        `,
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -38],
      })

      const marker = L.marker([locationPoint.lat, locationPoint.lng], {
        icon: pinIcon,
      }).addTo(layerGroup)

      if (address) {
        marker.bindPopup(`<strong>${address}</strong><br/>${locationPoint.lat.toFixed(5)}, ${locationPoint.lng.toFixed(5)}`)
      }

      map.setView([locationPoint.lat, locationPoint.lng], 15)
    } else if (
      locationMode === 'area' &&
      locationArea &&
      locationArea.points.length >= 3
    ) {
      const latlngs: [number, number][] = locationArea.points.map((p) => [
        p.lat,
        p.lng,
      ])

      const polygon = L.polygon(latlngs, {
        color: '#2563EB',
        weight: 3,
        opacity: 0.9,
        fillColor: '#3B82F6',
        fillOpacity: 0.22,
      }).addTo(layerGroup)

      // Add numbered vertex markers
      locationArea.points.forEach((point, index) => {
        const vertexIcon = L.divIcon({
          className: 'custom-vertex-pin',
          html: `<span>${index + 1}</span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        })

        L.marker([point.lat, point.lng], { icon: vertexIcon })
          .bindPopup(`Вершина #${index + 1}<br/>${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`)
          .addTo(layerGroup)
      })

      map.fitBounds(polygon.getBounds(), {
        padding: [40, 40],
        maxZoom: 16,
      })
    }
  }, [locationMode, locationPoint, locationArea, address])

  const pointsCount = locationArea?.points.length || 0

  return (
    <div className={styles.container}>
      <div className={styles.mapMetaBar}>
        <div className={styles.modeBadge}>
          {locationMode === 'point' ? (
            <>
              <IconMapPin size={16} />
              <span>Точка на карте</span>
            </>
          ) : (
            <>
              <IconPolygon size={16} />
              <span>Зона проведения ({pointsCount} вершин)</span>
            </>
          )}
        </div>

        <div className={styles.coordsInfo}>
          {locationMode === 'point' && locationPoint ? (
            <span>
              Координаты: {locationPoint.lat.toFixed(5)}, {locationPoint.lng.toFixed(5)}
            </span>
          ) : locationMode === 'area' && pointsCount > 0 ? (
            <span>Многоугольник из {pointsCount} точек границы</span>
          ) : null}
        </div>
      </div>

      <div className={styles.mapWrapper}>
        <div ref={mapContainerRef} className={styles.mapElement} />
      </div>
    </div>
  )
}
