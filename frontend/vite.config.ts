import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
},
  plugins: [
    vue(),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
   css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/assets/styles/foundations/variables.scss" as *;
          @use "@/assets/styles/foundations/_breakpoint.scss" as *;
        `
      }
    },
  }
})
