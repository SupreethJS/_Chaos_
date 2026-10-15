import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'Jarvis the Time Traveller',
        short_name: 'Jarvis',
        description: 'Jarvis the Time Traveller - AI agent workspace',
        theme_color: '#101827',
        background_color: '#f5f7fb',
        display: 'standalone',
        start_url: '/',
        icons: []
      }
    })
  ],
  server: { port: 5173 }
});
