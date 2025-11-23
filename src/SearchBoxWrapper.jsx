// This component uses Mapbox Search JS's SearchBox component
// Learn more about the props available at https://docs.mapbox.com/mapbox-search-js/api/react/search/

'use client'

import { useContext, useEffect, useMemo, useState } from 'react'
import { SearchBox } from '@mapbox/search-js-react'
import mapboxgl from 'mapbox-gl'
import { AppContext } from './Context/AppContext'
import PropTypes from 'prop-types'
import mapboxConfig from './mapboxConfig'
import { searchStores } from './utils/storeSearch'

const SearchBoxWrapper = ({ mapInstanceRef }) => {
  // Imported access token from your .env file
  const accessToken = import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN

  const {
    searchValue,
    setSearchValue,
    setSearchResult,
    activeLocation,
    setActiveLocation,
    setActiveFeature,
    setFeatures,
    storeFeatures
  } = useContext(AppContext)

  const [storeResults, setStoreResults] = useState([])
  const [isFocused, setIsFocused] = useState(false)

  const trimmedSearch = useMemo(() => searchValue.trim(), [searchValue])

  useEffect(() => {
    if (!trimmedSearch || trimmedSearch.length < 2) {
      setStoreResults([])
      return
    }

    const matches = searchStores(storeFeatures, trimmedSearch, 8)
    setStoreResults(matches)
  }, [storeFeatures, trimmedSearch])

  // set the search value as the user types
  const handleSearchChange = (newValue) => {
    setSearchValue(newValue)
  }

  const handleSearchResult = (value) => {
    if (!value?.features?.length) {
      return value
    }

    const coordinates = value.features[0]?.geometry?.coordinates
    if (!coordinates) {
      return value
    }

    setFeatures([])
    setActiveLocation({
      coords: coordinates,
      type: 'search'
    })
    setSearchResult(value)
    setActiveFeature(null)
    setStoreResults([])

    if (mapInstanceRef.current?.flyTo) {
      mapInstanceRef.current.flyTo({
        center: coordinates,
        zoom: 12,
        essential: true
      })
    }

    return value
  }

  const handleStoreSelect = (feature) => {
    if (!feature?.geometry?.coordinates) return
    setActiveFeature(feature)
    setFeatures([])
    setSearchResult(null)
    setStoreResults([])
    setSearchValue(feature.properties?.name ?? '')

    if (mapInstanceRef.current?.flyTo) {
      mapInstanceRef.current.flyTo({
        center: feature.geometry.coordinates,
        zoom: 14,
        essential: true
      })
    }
  }

  const mapCenter = mapInstanceRef.current?.getCenter?.()
  const proximity = mapCenter
    ? [mapCenter.lng, mapCenter.lat]
    : mapboxConfig.proximity

  const searchOptions = {
    types: mapboxConfig.types,
    country: mapboxConfig.country,
    language: mapboxConfig.language,
    ...(mapboxConfig.bbox ? { bbox: mapboxConfig.bbox } : {}),
    proximity
  }

  console.debug('SearchBox options', searchOptions)


  const showStoreResults =
    isFocused && storeResults.length > 0 && trimmedSearch.length > 0

  return (
    <div
      className='relative'
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => {
        setTimeout(() => setIsFocused(false), 150)
      }}
    >
      <SearchBox
        className='w-full'
        options={searchOptions}
        value={searchValue}
        onChange={handleSearchChange}
        accessToken={accessToken}
        mapboxgl={mapboxgl}
        placeholder={
          activeLocation?.type === 'user'
            ? 'Bruk min posisjon'
            : 'Søk etter adresse eller butikk'
        }
        map={mapInstanceRef.current}
        onRetrieve={handleSearchResult}
        theme={{
          variables: {
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 300,
            unit: '16px',
            borderRadius: '8px'
          }
        }}
      />

      {showStoreResults && (
        <div className='store-search-results'>
          <div className='store-search-results__header'>Butikker</div>
          <ul className='store-search-results__list'>
            {storeResults.map((feature) => {
              const { id, name, city, address, butikk } =
                feature.properties || {}
              const subtitle = [butikk, address, city].filter(Boolean).join(' · ')
              return (
                <li
                  key={id ?? `${name}-${feature.geometry.coordinates.join(',')}`}
                  className='store-search-results__item'
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleStoreSelect(feature)}
                >
                  <div className='store-search-results__title'>
                    {name || shoppingCenter || butikk || 'Butikk uten navn'}
                  </div>
                  {subtitle && (
                    <div className='store-search-results__meta'>{subtitle}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchBoxWrapper

SearchBoxWrapper.propTypes = {
  mapInstanceRef: PropTypes.object
}
