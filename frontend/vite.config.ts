import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // Your React app's development port
    proxy: {
      // Proxy all requests starting with '/api'
      '/api': {
        target: 'http://localhost:8080', // Your Go backend URL
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove '/api' prefix when forwarding
        // Optionally, if you have self-signed certs for local backend (unlikely here):
        secure: false,
        ws: true, // If you plan to proxy WebSockets as well
      },
    },
  },
})
