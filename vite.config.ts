import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Cloudflare Pages SPA routing fix:
      // Copies dist/index.html → dist/404.html after every production build.
      // Cloudflare serves 404.html for any route that has no matching static
      // file, so React Router takes over client-side — no _redirects loop.
      name: 'cloudflare-spa-404',
      closeBundle() {
        try {
          copyFileSync('dist/index.html', 'dist/404.html')
        } catch {
          // dev mode — dist doesn't exist yet, safe to ignore
        }
      },
    },
  ],
  server: {
    port: 9000,
    strictPort: true,   // fail loudly if port 9000 is taken
    hmr: {
      // Explicitly bind HMR WebSocket to the same port/host as the dev server
      // so Vite doesn't try a fallback port that causes ws:// connection failures
      protocol: 'ws',
      host: 'localhost',
      port: 9000,
      clientPort: 9000,
    },
    proxy: {
      // Forward all /api requests from the browser to the Hono backend.
      // This avoids direct cross-origin calls to port 3001 and eliminates
      // net::ERR_CONNECTION_REFUSED when the backend is behind a firewall/proxy.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
