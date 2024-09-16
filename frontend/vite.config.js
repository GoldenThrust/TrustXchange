import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      "short_name": "TrustXchange",
      "name": "TrustXchange Wallet",
      "icons": [
        {
          "src": "/logo.png",
          "size": "any",
          "type": "image/svg+xml"
        }
      ],
      "start_url": "/",
      "display": "standalone",
      "theme_color": "#000000",
      "background_color": "#ffffff"
    }
  })],
})
