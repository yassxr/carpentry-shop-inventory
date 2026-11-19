import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // "./" makes asset paths relative so the built index.html works when
  // loaded via file:// in Electron (production). "/" is fine for the dev server.
  base: command === 'build' ? './' : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
}))
