// The Map component instantiates a Mapbox GL JS map, adds mouse event listeners,
// sets constraints on the max bounds of the map (to the continental US), uses
// queryRenderedFeatures to return GeoJSON features after any movement (at high zoom
// levels) and utilizes useEffects to implement map.flyTo() animations based on state
// changes.  Note that we store our map instance in a Ref so we can use it in Markers.jsx
// and our mapContainer in a ref so that the Map does not re-render when the component does.

'use client'

import PropTypes from 'prop-types'
import { useRef, useEffect, useState, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import Marker from '../Marker'
import { AppContext } from '../Context/AppContext'
import { addUserLocationPulse } from './pulse'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

const LOCATION_LAYER_ID = 'steder-4lp2mj'

const Map = ({ onLoad }) => {
  const mapContainer = useRef(null)
  const controlRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const {
    activeFeature,
    setActiveFeature,
    activeLocation,
    features,
    setFeatures,
    denyLocation,
    isMobile
  } = useContext(AppContext)

  let mapRef = useRef(null)
  const pulseRef = useRef(null)
  const activeFeatureRef = useRef(activeFeature)
  const activeLocationRef = useRef(activeLocation)
  const hoverPopupRef = useRef(null)

  const flyToStoredLocation = () => {
    if (!mapRef.current) return

    const location = activeLocationRef.current

    if (location) {
      const fallbackZoom = location.type === 'user' ? 16 : 12
      mapRef.current.flyTo({
        center: location.coords,
        zoom: fallbackZoom,
        essential: true
      })
    } else {
      mapRef.current.flyTo({
        center: [10.75, 63.5],
        zoom: 4.2,
        essential: true
      })
    }
  }

  useEffect(() => {
    activeFeatureRef.current = activeFeature
  }, [activeFeature])

  useEffect(() => {
    activeLocationRef.current = activeLocation
  }, [activeLocation])

  // This demo imports accessToken from your .env file, to use this project
  // for your purposes, rename the .env.example file to .env and add your Mapbox access token.

  mapboxgl.accessToken = import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN

  useEffect(() => {
    if (mapRef.current) return // map already initialized

    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      // Custom style created in Mapbox Studio using the user's tileset.
      style: 'mapbox://styles/eon2525/cmi2vnw1t007w01qx1urh4tq0',
      center: [10.75, 63.5],
      zoom: 4.2
    }))

    hoverPopupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: [0, -25],
      className: 'store-hover-popup'
    })

    const renderHoverPopup = (event) => {
      if (!hoverPopupRef.current) return

      const foundFeatures =
        map.queryRenderedFeatures(event.point, {
          layers: [LOCATION_LAYER_ID]
        }) || []

      if (foundFeatures.length === 0) {
        hoverPopupRef.current.remove()
        return
      }

      const uniqueFeatures = []
      const seenIds = new Set()
      for (const feature of foundFeatures) {
        const id =
          feature.properties?.id ??
          `${feature.geometry.coordinates.join(',')}-${feature.properties?.name}`
        if (seenIds.has(id)) continue
        seenIds.add(id)
        uniqueFeatures.push(feature)
      }

      const popupContent = document.createElement('div')
      popupContent.className = 'map-hover-label'

      if (uniqueFeatures.length > 1) {
        popupContent.classList.add('map-hover-label--multi')
        const list = document.createElement('ul')
        list.className = 'map-hover-label__list'
        uniqueFeatures.forEach((feature) => {
          const item = document.createElement('li')
          item.className = 'map-hover-label__item'
          item.textContent = feature.properties?.name ?? 'Uten navn'
          list.appendChild(item)
        })
        popupContent.appendChild(list)
      } else {
        popupContent.textContent =
          uniqueFeatures[0].properties?.name ?? 'Uten navn'
      }

      const lngLat = event.lngLat ?? uniqueFeatures[0].geometry.coordinates

      hoverPopupRef.current
        .setDOMContent(popupContent)
        .setLngLat(lngLat)
        .addTo(map)
    }

    controlRef.current = new mapboxgl.NavigationControl()
    if (!isMobile) {
      map.addControl(controlRef.current)
    }

    const resizeLocationLayer = () => {
      const layer = map.getLayer(LOCATION_LAYER_ID)
      if (!layer) return

      if (layer.type === 'circle') {
        map.setPaintProperty(LOCATION_LAYER_ID, 'circle-radius', [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          4,
          8,
          6,
          12,
          9,
          14,
          11,
          16,
          14
        ])
      }
    }

    map.on('load', () => {
      resizeLocationLayer()
      onLoad(map)
      setMapLoaded(true)
    })

    map.on('styledata', resizeLocationLayer)

    // Restrict the map to Norway to match the dataset bounds.
    map.setMaxBounds([
      [4, 57], // SouthWest coordinates
      [32, 72] // Northeast coordinates
    ])

    // Change the cursor to a pointer when the mouse is over a feature in the store layer.
    map.on('mouseenter', LOCATION_LAYER_ID, (event) => {
      map.getCanvas().style.cursor = 'pointer'
      renderHoverPopup(event)
    })

    map.on('mousemove', LOCATION_LAYER_ID, (event) => {
      renderHoverPopup(event)
    })

    // Change it back when it leaves.
    map.on('mouseleave', LOCATION_LAYER_ID, () => {
      map.getCanvas().style.cursor = ''
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove()
      }
    })

    map.on('moveend', () => {
      const zoom = map.getZoom()

      // Set minimum zoom to query & render locations
      if (Math.round(zoom) >= 10) {
        // This query requests features from the unclustered layer in our tileset and
        // retrieves all features visible in the map viewport
        const locationsInView = mapRef.current.queryRenderedFeatures({
          layers: [LOCATION_LAYER_ID]
        })
        const bounds = map.getBounds()
        const seenIds = new Set()
        const filtered = []

        for (const feature of locationsInView) {
          const coords = feature.geometry?.coordinates
          if (!coords || coords.length < 2) continue

          const [lng, lat] = coords
          const id =
            feature.properties?.id ??
            `${lng},${lat}-${feature.properties?.name ?? 'ukjent'}`

          if (
            lng >= bounds.getWest() &&
            lng <= bounds.getEast() &&
            lat >= bounds.getSouth() &&
            lat <= bounds.getNorth() &&
            !seenIds.has(id)
          ) {
            seenIds.add(id)
            filtered.push(feature)
          }
        }

        setFeatures(filtered)
      }
    })

    map.on('zoomend', () => {
      const zoom = map.getZoom()
      // Set minimum zoom to query & render locations
      if (Math.round(zoom) <= 10) {
        setFeatures([])
      }
    })

    // Add a click event listener to the map
    map.on('click', function (e) {
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove()
      }
      const feature = map.queryRenderedFeatures(e.point, {
        layers: [LOCATION_LAYER_ID]
      })
      if (feature.length) {
        const clickedFeature = feature[0]
        if (
          activeFeatureRef.current &&
          clickedFeature.properties?.id ===
            activeFeatureRef.current.properties?.id
        ) {
          setActiveFeature(null)
          flyToStoredLocation()
        } else {
          setActiveFeature(clickedFeature)
        }
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.off('styledata', resizeLocationLayer)
      }
    }
  }, [])

  // Move Map to searched location or User's location
  useEffect(() => {
    if (activeLocation !== null) {
      if (activeLocation.type === 'user' && pulseRef.current == null) {
        addUserLocationPulse(mapRef, pulseRef, activeLocation)
      }

      const targetZoom = activeLocation.type === 'user' ? 16 : 12

      mapRef.current.flyTo({
        center: activeLocation.coords,
        essential: true,
        zoom: targetZoom
      })
    }
  }, [activeLocation])

  useEffect(() => {
    if (!mapRef.current) return

    if (!activeFeature) {
      flyToStoredLocation()
      return
    }

    const coordinates = activeFeature.geometry?.coordinates
    if (!coordinates) return

    const currentZoom = mapRef.current.getZoom()
    mapRef.current.flyTo({
      center: coordinates,
      zoom: Math.max(currentZoom, 14),
      essential: true
    })
  }, [activeFeature, activeLocation])

  // If user does not share location
  useEffect(() => {
    if (denyLocation) {
      setTimeout(() => {
        // Fly to Demo City (Seattle)
        mapRef.current.flyTo({
          center: [-122.33935, 47.60774],
          essential: true,
          zoom: 11
        })
      }, 2000)
    }
  }, [denyLocation])

  useEffect(() => {
    const hasControl = mapRef.current.hasControl(controlRef.current)

    if (hasControl && isMobile) {
      mapRef.current.removeControl(controlRef.current)
    } else if (!hasControl && !isMobile) {
      mapRef.current.addControl(controlRef.current)
    }
  }, [isMobile])

  return (
    <>
      <div ref={mapContainer} className='grow' />
      {mapLoaded && features && <Marker mapRef={mapRef.current} />}
    </>
  )
}

Map.propTypes = {
  onLoad: PropTypes.func
}

export default Map

