// The CardList component renders GeoJSON feature information retrieved by
// queryRenderedFeatures() in Map/index.jsx. GeoJSON can have any data you'd like
// to store inside the 'feature.properties' object. This component also uses the web API
// scrollIntoView() to scroll the active Feature (either clicked on the map or in the sidebar)
// to the top position.

'use client'

import React, { useRef, useEffect, useContext } from 'react'
import Card from './Card'
import { AppContext } from './Context/AppContext'

const CardList = () => {
  const locationRefs = useRef([])
  const { features, activeFeature, setActiveFeature, isMobile } =
    useContext(AppContext)

  // on click, set the active feature
  const handleFeatureClick = (feature) => {
    const isSameFeature =
      activeFeature?.properties?.id === feature.properties?.id

    if (isSameFeature) {
      setActiveFeature(null)
    } else {
      setActiveFeature(feature)
    }
  }

  // Reset locationRefs when the locations array changes
  useEffect(() => {
    locationRefs.current = [] // Clear the refs array when new locations are populated
  }, [features])

  // Scroll to the active location when it changes (desktop only)
  useEffect(() => {
    if (
      activeFeature &&
      locationRefs.current[activeFeature.properties.id] &&
      !isMobile
    ) {
      locationRefs.current[activeFeature.properties.id].scrollIntoView({
        behavior: 'smooth', // Optionally smooth scrolling
        block: 'start' // Align the element to the top of the container
      })
    }
  }, [activeFeature, isMobile])

  return (
    <div className='overflow-y-auto invisible sm:visible h-0 sm:h-auto'>
      {features.length > 0 &&
        features.map((feature, i) => {
          return (
            <div
              key={i}
              ref={(el) => (locationRefs.current[feature.properties.id] = el)}
              className='mb-1.5'
            >
              <Card
                feature={feature}
                onClick={handleFeatureClick}
                activeFeature={activeFeature}
              />
            </div>
          )
        })}

      {features.length === 0 && (
        <div className='my-4 mx-5 text-slate-400'>
          Søk eller zoom inn for å vise virksomheter i området.
        </div>
      )}
    </div>
  )
}

export default CardList
