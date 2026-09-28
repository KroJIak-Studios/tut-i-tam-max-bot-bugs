import L from 'leaflet'
import type { AppMapProviderId } from '../types'

export type MapEngineType = 'leaflet-raster' | 'yandex-sdk' | 'google-sdk' | 'maplibre-gl'

export interface MapProviderDefinition {
  id: AppMapProviderId
  engine: MapEngineType
  nameKey: string
  descriptionKey: string
  attributionKey: string
  rawAttribution: string
  isAvailable: () => boolean
  tileUrl?: string
  tileOptions?: L.TileLayerOptions
}

export const MAP_PROVIDERS: Record<AppMapProviderId, MapProviderDefinition> = {
  osm: {
    id: 'osm',
    engine: 'leaflet-raster',
    nameKey: 'mapProviders.osm.name',
    descriptionKey: 'mapProviders.osm.description',
    attributionKey: 'mapProviders.osm.attribution',
    rawAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    isAvailable: () => true,
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileOptions: {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    },
  },
  osm_hot: {
    id: 'osm_hot',
    engine: 'leaflet-raster',
    nameKey: 'mapProviders.osm_hot.name',
    descriptionKey: 'mapProviders.osm_hot.description',
    attributionKey: 'mapProviders.osm_hot.attribution',
    rawAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank" rel="noopener noreferrer">HOT</a>',
    isAvailable: () => true,
    tileUrl: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    tileOptions: {
      subdomains: 'abc',
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, <a href="https://www.hotosm.org/" target="_blank" rel="noopener noreferrer">HOT</a>',
    },
  },
  carto_voyager: {
    id: 'carto_voyager',
    engine: 'leaflet-raster',
    nameKey: 'mapProviders.carto_voyager.name',
    descriptionKey: 'mapProviders.carto_voyager.description',
    attributionKey: 'mapProviders.carto_voyager.attribution',
    rawAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    isAvailable: () => Boolean(import.meta.env.VITE_CARTO_MAPS_API_KEY),
    tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    tileOptions: {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    },
  },
  yandex: {
    id: 'yandex',
    engine: 'yandex-sdk',
    nameKey: 'mapProviders.yandex.name',
    descriptionKey: 'mapProviders.yandex.description',
    attributionKey: 'mapProviders.yandex.attribution',
    rawAttribution: '&copy; Яндекс Карта',
    isAvailable: () => Boolean(import.meta.env.VITE_YANDEX_MAPS_API_KEY),
  },
  google: {
    id: 'google',
    engine: 'google-sdk',
    nameKey: 'mapProviders.google.name',
    descriptionKey: 'mapProviders.google.description',
    attributionKey: 'mapProviders.google.attribution',
    rawAttribution: '&copy; Google Maps',
    isAvailable: () => Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY),
  },
}

export const DEFAULT_APP_MAP_PROVIDER_ID: AppMapProviderId = 'osm'

export function getAppMapProvider(id?: string | null): MapProviderDefinition {
  if (id && id in MAP_PROVIDERS) {
    const candidate = MAP_PROVIDERS[id as AppMapProviderId]
    if (candidate.isAvailable()) {
      return candidate
    }
  }
  return MAP_PROVIDERS[DEFAULT_APP_MAP_PROVIDER_ID]
}

export function getAvailableAppMapProviders(): MapProviderDefinition[] {
  return Object.values(MAP_PROVIDERS).filter((p) => p.isAvailable())
}

export function createMapTileLayer(providerId?: string | null): L.TileLayer {
  const provider = getAppMapProvider(providerId)
  if (provider.tileUrl) {
    return L.tileLayer(provider.tileUrl, provider.tileOptions || {})
  }
  const defaultProvider = MAP_PROVIDERS[DEFAULT_APP_MAP_PROVIDER_ID]
  return L.tileLayer(defaultProvider.tileUrl!, defaultProvider.tileOptions || {})
}
