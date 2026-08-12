import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // The browser still sends an `Origin: http://localhost:5173` header on
        // same-origin POST/PUT/DELETE requests. Rewrite it to match the proxy
        // target so Spring Security's CORS filter sees a same-origin request
        // instead of rejecting it — keeps the backend's CORS config untouched.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('origin', 'http://localhost:8080')
          })
        },
      },
    },
  },
})
