import React, { createContext, useState, useEffect, useMemo } from 'react'
import storeGeoJsonRaw from '../../steder.geojson?raw'

// Basic heuristics to detect the platform the app runs on.
const detectPlatform = () => {
  if (typeof navigator === 'undefined') {
    return {
      platform: 'unknown',
      isIOS: false,
      isAndroid: false,
      isWindows: false,
      isMac: false,
      isLinux: false,
      isMobile: false,
      isDesktop: true
    }
  }

  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === 'MacIntel' &&
      typeof navigator.maxTouchPoints === 'number' &&
      navigator.maxTouchPoints > 1)
  const isAndroid = /Android/i.test(ua)
  const isWindows = /Win/.test(platform)
  const isMac = /Mac/.test(platform) && !isIOS
  const isLinux = /Linux/.test(platform) && !isAndroid
  const isMobile = isIOS || isAndroid

  const resolvedPlatform = isIOS
    ? 'ios'
    : isAndroid
    ? 'android'
    : isWindows
    ? 'windows'
    : isMac
    ? 'mac'
    : isLinux
    ? 'linux'
    : 'web'

  return {
    platform: resolvedPlatform,
    isIOS,
    isAndroid,
    isWindows,
    isMac,
    isLinux,
    isMobile,
    isDesktop: !isMobile
  }
}

const getInitialIsMobile = (deviceInfo) => {
  if (typeof window === 'undefined') return deviceInfo.isMobile
  return deviceInfo.isMobile || window.innerWidth < 640
}

// Create App level context
export const AppContext = createContext()

// Create a provider component
export const AppContextProvider = ({ children }) => {
  const initialDeviceInfo = detectPlatform()
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
  const [deviceInfo, setDeviceInfo] = useState(initialDeviceInfo)
  // Set state based on screen size for responsive component rendering
  const [isMobile, setIsMobile] = useState(getInitialIsMobile(initialDeviceInfo))

  // Handle resize events to update isMobile state
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const currentInfo = detectPlatform()
      setDeviceInfo(currentInfo)
      setIsMobile(currentInfo.isMobile || window.innerWidth < 640)
    }

    handleResize()
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
      deviceInfo,
      platform: deviceInfo.platform,
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
      deviceInfo,
      isMobile,
      storeFeatures
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
