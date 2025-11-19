import react from '@vitejs/plugin-react'
import path from 'path'

export default {
  plugins: [react()],
  base: '/demo-store-locator',
  envDir: '.',
  resolve: {
    alias: {
      'mapbox-demo-components': path.resolve(__dirname, './demo-components/src')
    }
  }
}
