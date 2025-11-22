import React, { createContext, useState, useEffect, useMemo } from 'react'
import storeGeoJsonRaw from '../../steder.geojson?raw'

// Create App level context
export const AppContext = createContext()

// Create a provider component
export const AppContextProvider = ({ children }) => {
  // Stores the feature that the user is currently viewing (triggers the marker/popup)
  const [activeFeature, setActiveFeature] = useState()
  // activeLocation rendered on the map
  const [activeLocation, setActiveLocation] = useState(null)
  // The store data in the current map viewport. Rendered in CardList, updated whenever the viewport changes
  const [features, setFeatures] = useState([])
  // Allow/Deny location sharing for app
  const [denyLocation, setDenyLocation] = useState(null)
  // hoveredFeature set by hovering store listing in LocationsListing
  const [hoveredFeature, setHoveredFeature] = useState(null)
  // Loading state to manage loading spinner
  const [loadingUserLocation, setLoadingUserLocation] = useState(false)
  // The current search value, used in the controlled SearchBox input
  const [searchValue, setSearchValue] = useState('')
  // The selected search result, chosen from SearchBox suggestions
  const [searchResult, setSearchResult] = useState(null)
  // Set state based on screen size for responsive component rendering
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

  // Handle resize events to update isMobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const storeFeatures = useMemo(() => {
    try {
      const parsed = JSON.parse(storeGeoJsonRaw)
      return parsed?.features ? [...parsed.features] : []
    } catch (error) {
      console.error('Kunne ikke laste butikkdata', error)
      return []
    }
  }, [])

  const value = useMemo(
    () => ({
      activeFeature,
      setActiveFeature,
      activeLocation,
      setActiveLocation,
      features,
      setFeatures,
      denyLocation,
      setDenyLocation,
      hoveredFeature,
      setHoveredFeature,
      loadingUserLocation,
      setLoadingUserLocation,
      searchResult,
      setSearchResult,
      searchValue,
      setSearchValue,
      isMobile,
      setIsMobile,
      storeFeatures
    }),
    [
      activeFeature,
      activeLocation,
      features,
      denyLocation,
      hoveredFeature,
      loadingUserLocation,
      searchResult,
      searchValue,
      isMobile,
      storeFeatures
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
