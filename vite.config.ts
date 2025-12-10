import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      'imgetoocrui.onrender.com',
      '.onrender.com', // Allow all Render subdomains
      'localhost',
    ],
  },
})

