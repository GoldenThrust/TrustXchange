import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      "description": "TrustXchange is an innovative Web5 application that leverages the power of decentralized identity and financial interoperability through the TBDex SDK. It facilitates secure transactions between wallet applications and liquidity providers, enabling seamless peer-to-peer exchanges while utilizing the latest Web5 and decentralized protocols. Developed as part of the TBDex Hackathon, TrustXchange pushes the boundaries of decentralized finance and identity solutions. The project emphasizes user ease by providing an intuitive, efficient, and secure financial experience.",
      "display": "standalone",
      "short_name": "TrustXchange",
      "name": "TrustXchange Wallet",
      "icons": [
        {
          "src": "/logo.svg",
          "sizes": "48x48",
          "type": "image/svg+xml"
        }
      ],
      "categories": ["business", "finance", "transactions", "web5", "wallet"],
      "start_url": "/",
      "theme_color": "#000000",
      "background_color": "#ffffff"
    }
  })],
})
