import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // './' makes the built files link to each other relatively, so the app works
  // wherever it's uploaded — a domain root, or a folder like /teams/beans-pesto/.
  base: './',
  plugins: [react()],
})
