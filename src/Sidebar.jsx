// The Sidebar component holds a Location UI component, the Mapbox Search JS 'SearchBox'
// component, the CardListent and a nested flex layout via Tailwind classes
// This component hides portions of itself on mobile, reducing down to just the UseMyLocation
// and SearchBoxWrapper on small screens.

'use client'

import React, { useContext } from 'react'
import CardList from './CardList'
import SearchBoxWrapper from './SearchBoxWrapper'
import { AppContext } from './Context/AppContext'
import UseMyLocation from './UseMyLocation'

const Sidebar = ({ mapInstanceRef }) => {
  const {
    features,
    setFeatures,
    denyLocation,
    setDenyLocation,
    setSearchValue,
    activeFeature,
    setActiveFeature,
    setActiveLocation
  } = useContext(AppContext)

  const handleReset = () => {
    setActiveFeature(null)
    setActiveLocation(null)
    setSearchValue('')
    setFeatures([])
  }

  return (
    <div
      style={{ maxHeight: `calc(100vh - 6rem)` }}
      className='flex flex-col gap-4 w-full sm:w-96 p-4 bg-white/95 sm:bg-transparent overflow-y-auto sm:overflow-visible'
    >
      <div className='sticky top-0 z-20 flex flex-col gap-3 sm:block sm:gap-0 bg-white/95 sm:bg-transparent pb-3 sm:pb-0'>
        <UseMyLocation
          denyLocation={denyLocation}
          setDenyLocation={setDenyLocation}
          setSearchValue={setSearchValue}
        />
        <SearchBoxWrapper mapInstanceRef={mapInstanceRef} />
      </div>

      <div>
        <div className='text-2xl text-black font-semibold w-full mb-1.5 mt-6 z-0'>
          Virksomheter
        </div>
        <div className='mb-4 font-medium text-gray-500'>
          <span className='text-maroon font-bold'>{features.length}</span>{' '}
          virksomheter i nærheten
        </div>
        {(activeFeature || features.length > 0) && (
          <button
            onClick={handleReset}
            className='text-sm text-maroon underline mb-4'
          >
            Tilbakestill søk
          </button>
        )}
      </div>

      <CardList />
    </div>
  )
}

export default Sidebar
