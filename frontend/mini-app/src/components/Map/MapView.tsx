import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapEvent, MapZone } from '../../types'
import { KAZAN_MAP_CENTER, USER_CURRENT_LOCATION } from '../../mocks/mapData'
import styles from './MapView.module.css'

interface MapViewProps {
  events: MapEvent[]
  zones: MapZone[]
  selectedEventId: string | null
  isAddingMarkerMode: boolean
  onSelectEvent: (event: MapEvent) => void
  onMapClick: (lat: number, lng: number) => void
  onDeselect: () => void
}

function createPinIcon(isSelected: boolean, isUserSource: boolean): L.DivIcon {
  const pinColor = '#2563EB'
  const size = isSelected ? 42 : 36
  const userDotHtml = isUserSource ? `<div class="tut-pin-user-badge"></div>` : ''

  const html = `
    <div class="tut-pin-wrapper ${isSelected ? 'tut-pin-selected' : ''}">
      <svg class="tut-pin-svg" width="${size}" height="${size}" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.05888 0 0 8.05888 0 18C0 28.5 18 42 18 42C18 42 36 28.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="${pinColor}"/>
        <circle cx="18" cy="17" r="6" fill="#FFFFFF"/>
      </svg>
      ${userDotHtml}
    </div>
  `

  return L.divIcon({
    className: 'tut-pin-leaflet-icon',
    html,
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 6],
  })
}

function createUserLocationIcon(): L.DivIcon {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div class="tut-user-location-pulse"></div>
      <div class="tut-user-location-marker">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#4B5563">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    </div>
  `

  return L.divIcon({
    className: 'tut-user-location-leaflet-icon',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export const MapView: React.FC<MapViewProps> = ({
  events,
  zones,
  selectedEventId,
  isAddingMarkerMode,
  onSelectEvent,
  onMapClick,
  onDeselect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const zonesLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: KAZAN_MAP_CENTER,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    })

    // Clean, free OpenStreetMap tiles with no API key required and no watermarks
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    const zonesLayer = L.layerGroup().addTo(map)
    const markersLayer = L.layerGroup().addTo(map)

    // Current user location pin
    const userMarker = L.marker(USER_CURRENT_LOCATION, {
      icon: createUserLocationIcon(),
      zIndexOffset: 500,
    }).addTo(map)

    mapInstanceRef.current = map
    zonesLayerRef.current = zonesLayer
    markersLayerRef.current = markersLayer
    userMarkerRef.current = userMarker

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update map click handler
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddingMarkerMode) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      } else {
        onDeselect()
      }
    }

    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
    }
  }, [isAddingMarkerMode, onMapClick, onDeselect])

  // Update Zones
  useEffect(() => {
    const zonesLayer = zonesLayerRef.current
    if (!zonesLayer) return

    zonesLayer.clearLayers()

    zones.forEach((zone) => {
      const isPark = zone.type === 'park'
      const polygon = L.polygon(zone.coordinates, {
        color: isPark ? '#059669' : '#2563EB',
        fillColor: isPark ? '#10B981' : '#3B82F6',
        fillOpacity: 0.18,
        weight: 1.5,
      })
      polygon.addTo(zonesLayer)
    })
  }, [zones])

  // Update Markers
  useEffect(() => {
    const markersLayer = markersLayerRef.current
    if (!markersLayer) return

    markersLayer.clearLayers()

    events.forEach((evt) => {
      const isSelected = evt.id === selectedEventId
      const isUserSource = evt.source === 'user'

      const marker = L.marker([evt.latitude, evt.longitude], {
        icon: createPinIcon(isSelected, isUserSource),
        zIndexOffset: isSelected ? 1000 : 100,
      })

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e)
        onSelectEvent(evt)
        // Gently pan to center marker
        mapInstanceRef.current?.panTo([evt.latitude, evt.longitude], {
          animate: true,
          duration: 0.4,
        })
      })

      marker.addTo(markersLayer)
    })
  }, [events, selectedEventId, onSelectEvent])

  return <div ref={mapContainerRef} className={styles.mapContainer} />
}
