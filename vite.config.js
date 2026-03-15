import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite adds crossorigin to script/link tags for web CORS — this breaks file:// loading in Electron
const removeCrossorigin = {
  name: 'remove-crossorigin',
  transformIndexHtml: (html) => html.replace(/ crossorigin/g, ''),
}

export default defineConfig({
  plugins: [react(), removeCrossorigin],
  base: './',
  server: {
    port: 5173,
    open: false,
  }
})
