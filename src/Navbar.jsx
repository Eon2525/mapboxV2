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

      <header className='relative flex shrink-0 items-center justify-center h-24 border-b border-gray-200 bg-white z-10 px-6 pl-28 sm:px-8 sm:pl-36'>
        <div className='absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 flex items-center gap-3'>
          <img src={hkLogo} alt='HK Norge' className='h-10 sm:h-12 w-auto' />
        </div>
        <h1 className='text-2xl sm:text-3xl font-bold text-maroon tracking-wide text-center'>
          Ordna forhold
        </h1>
      </header>
    </>
  )
}

export default Navbar
