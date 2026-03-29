import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React and React DOM
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // UI libraries
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'ui-vendor';
            }
            // Form libraries
            if (id.includes('formik') || id.includes('yup')) {
              return 'form-vendor';
            }
            // Stripe
            if (id.includes('@stripe')) {
              return 'stripe-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
          // Admin pages chunk
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
})
