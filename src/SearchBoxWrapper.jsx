// This component uses Mapbox Search JS's SearchBox component
// Learn more about the props available at https://docs.mapbox.com/mapbox-search-js/api/react/search/

'use client'

import { useContext } from 'react'
import { SearchBox } from '@mapbox/search-js-react'
import mapboxgl from 'mapbox-gl'
import { AppContext } from './Context/AppContext'
import PropTypes from 'prop-types'
import mapboxConfig from './mapboxConfig'

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
    setFeatures
  } = useContext(AppContext)

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

    if (mapInstanceRef.current?.flyTo) {
      mapInstanceRef.current.flyTo({
        center: coordinates,
        zoom: 12,
        essential: true
      })
    }

    return value
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


  return (
    <SearchBox
      className='w-32 sticky'
      options={searchOptions}
      value={searchValue}
      onChange={handleSearchChange}
      accessToken={accessToken}
      mapboxgl={mapboxgl}
      placeholder={
        activeLocation?.type === 'user'
          ? 'Bruk min posisjon'
          : 'Søk etter adresse, by eller kjøpesenter'
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
  )
}

export default SearchBoxWrapper

SearchBoxWrapper.propTypes = {
  mapInstanceRef: PropTypes.object
}
