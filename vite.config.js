import react from '@vitejs/plugin-react'
import path from 'path'

export default {
  plugins: [react()],
  base: '/mapboxV2',
  envDir: '.',
  resolve: {
    alias: {
      'mapbox-demo-components': path.resolve(__dirname, './demo-components/src')
    }
  }
}
