import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Exposes the server to the container
    hmr: {
      clientPort: 443 // Ensures Hot Module Replacement works in Replit's iframe
    }
  }
})