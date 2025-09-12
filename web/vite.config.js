import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
  },
  build: {
    outDir: 'dist',
    // Optimize bundle size
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800, // Increased for transformers chunk
    // Address onnxruntime-web eval warnings
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: './index.html',
      },
      // Manual chunk splitting for better code organization and lazy loading
      output: {
        manualChunks: (id) => {
          // Group all transformers/embedding related code into separate chunk
          if (id.includes('@xenova/transformers') || id.includes('onnxruntime')) {
            return 'transformers';
          }
          
          // Group PouchDB database modules together
          if (id.includes('pouchdb') || id.includes('database')) {
            return 'database';
          }
          
          // Group UI component libraries
          if (id.includes('lucide-react') || id.includes('react-markdown') || id.includes('highlight.js')) {
            return 'ui-libs';
          }
          
          // React and core dependencies
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          // Keep main bundle small
          return undefined;
        }
      },
      external: [],
    },
  },
  optimizeDeps: {
    // Pre-bundle only essential modules for browser compatibility
    include: [
      'pouchdb-core',
      'pouchdb-adapter-idb', 
      'pouchdb-find',
      'react',
      'react-dom',
      'clsx',
      'class-variance-authority'
    ],
    // Exclude large ML libraries and problematic Node.js modules
    exclude: [
      '@xenova/transformers', // Lazy load for RAG features
      'events',
      'pouchdb-mapreduce',
      'pouchdb-replication',
      'pouchdb-utils'
    ]
  },
  define: {
    // Define global for PouchDB compatibility
    global: 'globalThis',
    // Polyfill process for browser compatibility
    'process.env': {},
    'process.nextTick': 'setTimeout',
  },
  resolve: {
    alias: {
      // Provide browser-compatible polyfills for Node.js modules
      events: 'events',
      util: 'util',
      buffer: 'buffer',
      process: 'process/browser',
    }
  }
})