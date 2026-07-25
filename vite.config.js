import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'Face Attendance System',
        short_name: 'FaceAttend',
        description: 'A modern face recognition-based attendance tracking system',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      // generateSW builds the service worker from JSON config only: the old
      // runtimeCaching block passed a cacheKeyWillBeUsed *function*, which fails
      // workbox's schema validation and broke every production build. It also
      // only matched https://api.* - never this app's API host - so nothing is
      // lost by dropping it. API traffic now always hits the network, which is
      // what attendance data needs.
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      }
    })
  ],
})
