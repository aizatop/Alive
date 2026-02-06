import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.',
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/Alive/' : '/',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist'
  }
})
