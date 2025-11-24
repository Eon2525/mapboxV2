// This returns our Mapbox Tooltips for demo purposes. This is imported from
// `projects/demo-components` in this repo and can easily be removed.
// The remaining Navbar is for layout purposes only.

'use client'

import React from 'react'
import { MapboxTooltips } from 'mapbox-demo-components'
import hkLogo from '/img/hk-logo.svg'

const Navbar = () => {
  return (
    <>
      <div className='hidden sm:block'>
        <MapboxTooltips
          products={[
            'Mapbox GL JS',
            'Mapbox Search JS',
            'MTS Clustering',
            'Mapbox Standard Style',
            'Map Markers',
            'Popups',
            'Source Code'
          ]}
        />
      </div>

      <header className='relative flex flex-col sm:flex-row shrink-0 items-center justify-center gap-2 sm:gap-0 bg-white border-b border-gray-200 z-10 px-4 py-4 sm:px-8 sm:py-0 sm:h-24'>
        <div className='flex items-center gap-3 sm:absolute sm:left-8 sm:top-1/2 sm:-translate-y-1/2'>
          <img src={hkLogo} alt='HK Norge' className='h-10 sm:h-12 w-auto' />
        </div>
        <h1 className='text-2xl sm:text-3xl font-bold text-maroon tracking-wide text-center sm:text-left'>
          Ordna forhold
        </h1>
      </header>
    </>
  )
}

export default Navbar
