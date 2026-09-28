import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapEvent, MapZone } from '../../types'
import { useUserPreferences } from '../../context/useUserPreferences'
import { createMapTileLayer } from '../../services/mapProviders'
import { KAZAN_MAP_CENTER, USER_CURRENT_LOCATION } from '../../mocks/mapData'
import { MapEventCard } from './MapEventCard'
import styles from './MapView.module.css'

interface MapViewProps {
  events: MapEvent[]
  zones: MapZone[]
  selectedEventId: string | null
  selectedEvent: MapEvent | null
  onSelectEvent: (event: MapEvent) => void
  onDeselect: () => void
  onToggleGoing: (eventId: string) => void
  onMoreDetails?: (event: MapEvent) => void
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
  selectedEvent,
  onSelectEvent,
  onDeselect,
  onToggleGoing,
  onMoreDetails,
}) => {
  const { preferences } = useUserPreferences()
  const appMapProviderRef = useRef(preferences.appMapProvider)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const zonesLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)

  const [popupContainer] = useState<HTMLDivElement>(() => document.createElement('div'))
  const popupInstanceRef = useRef<L.Popup | null>(null)

  useEffect(() => {
    appMapProviderRef.current = preferences.appMapProvider
  }, [preferences.appMapProvider])

  // Prevent map clicks / scrolls when interacting inside the popup card
  useEffect(() => {
    L.DomEvent.disableClickPropagation(popupContainer)
    L.DomEvent.disableScrollPropagation(popupContainer)
  }, [popupContainer])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: KAZAN_MAP_CENTER,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    })

    // Dedicated attribution control with compact, legally compliant attribution
    const attributionControl = L.control.attribution({
      position: 'bottomright',
      prefix: false,
    })
    attributionControl.addTo(map)

    // Initial tile layer from preferences
    const initialTile = createMapTileLayer(appMapProviderRef.current)
    initialTile.addTo(map)
    tileLayerRef.current = initialTile

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
      if (popupInstanceRef.current) {
        popupInstanceRef.current.remove()
        popupInstanceRef.current = null
      }
      map.remove()
      mapInstanceRef.current = null
      tileLayerRef.current = null
    }
  }, [])

  // Dynamic Basemap switching without disturbing markers or zones
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    const nextLayer = createMapTileLayer(preferences.appMapProvider)
    nextLayer.addTo(map)
    tileLayerRef.current = nextLayer
  }, [preferences.appMapProvider])

  // Synchronize Popup with selectedEvent
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (!selectedEvent) {
      if (popupInstanceRef.current) {
        popupInstanceRef.current.remove()
      }
      return
    }

    if (!popupInstanceRef.current) {
      popupInstanceRef.current = L.popup({
        offset: [0, -38],
        closeButton: false,
        className: 'tut-custom-popup',
        autoPan: true,
        autoPanPaddingTopLeft: [16, 130],
        autoPanPaddingBottomRight: [16, 140],
        autoClose: false,
        closeOnClick: false,
      }).setContent(popupContainer)
    }

    popupInstanceRef.current
      .setLatLng([selectedEvent.latitude, selectedEvent.longitude])
      .openOn(map)
  }, [selectedEvent, popupContainer])

  // Update map click handler to deselect marker
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const handleMapClick = () => {
      onDeselect()
    }

    map.on('click', handleMapClick)
    return () => {
      map.off('click', handleMapClick)
    }
  }, [onDeselect])

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
        fillOpacity: 0.14,
        weight: 1.2,
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
      })

      marker.addTo(markersLayer)
    })
  }, [events, selectedEventId, onSelectEvent])

  return (
    <div ref={mapContainerRef} className={styles.mapContainer}>
      {selectedEvent &&
        createPortal(
          <MapEventCard
            event={selectedEvent}
            onToggleGoing={onToggleGoing}
            onMoreDetails={onMoreDetails}
          />,
          popupContainer
        )}
    </div>
  )
}
