import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: [],
      manifest: {
        name: 'Ceaverse Portal',
        short_name: 'Ceaverse',
        description:
          'Ebooks, floor plans, wayfinding, lost & found, and student voice for Engineering & Architecture students.',
        theme_color: '#180404',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}', 'apple-touch-icon.png'],
        globIgnores: ['**/pdf.worker*'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/media\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) => {
              if (request.method !== 'GET') return false
              if (request.headers.has('Authorization')) return false
              if (url.pathname.includes('/admin/')) return false

              const publicPaths = [
                '/api/landing/content',
                '/api/ebooks',
                '/api/floorplans/buildings',
                '/api/floorplans/floor-plans',
                '/api/wayfinding/locations',
                '/api/lost-found/items',
                '/api/voice',
              ]

              return publicPaths.some(
                (path) => url.pathname === path || url.pathname.startsWith(`${path}/`),
              )
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'public-api-v1',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*\/image\/upload\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ request, sameOrigin }) =>
              Boolean(sameOrigin && request.destination === 'image'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/assets\/.*pdf\.worker.*\.(?:mjs|js)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-worker',
              expiration: {
                maxEntries: 2,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
