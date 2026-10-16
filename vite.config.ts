import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base: './' leidžia talpinti programėlę bet kuriame kataloge (pvz. GitHub Pages /cv-generatorius/)
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 800 },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'CV generatorius',
        short_name: 'CV',
        description: 'Asmeninis CV redaktorius su PDF eksportu',
        lang: 'lt',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#2E3A4B',
        background_color: '#EEF0F3',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // Viskas (JS, CSS, šriftai, paveikslėliai) talpinama iš anksto, kad veiktų be interneto.
        globPatterns: ['**/*.{js,css,html,woff2,png,jpg,svg,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
