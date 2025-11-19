import { useEffect } from 'react'

const PageShell = ({ children }) => {
  useEffect(() => {
    // @mapbox/web-analytics is inline in the HTML index.html for each project
    // set mapbox metadata before initializing analytics
    window.mbxMetadata = {
      content_type: 'developer-tool'
    }

    // Only initialize analytics if the function is available
    if (typeof window !== 'undefined' && typeof window.initializeMapboxAnalytics === 'function') {
      try {
        window.initializeMapboxAnalytics({
          marketoMunchkin: false
        })
      } catch (error) {
        // Silently fail if analytics initialization fails
        console.warn('Mapbox analytics initialization failed:', error)
      }
    }
  }, [])
  return children
}

export default PageShell
