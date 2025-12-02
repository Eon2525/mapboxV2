import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'

  return {
    plugins: [react()],
    base,
    envDir: '.',
    resolve: {
      alias: {
        'mapbox-demo-components': path.resolve(
          __dirname,
          './demo-components/src'
        )
      }
    }
  }
})
