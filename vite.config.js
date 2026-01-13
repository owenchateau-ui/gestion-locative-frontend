import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Augmenter la limite d'avertissement
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Optimisation des chunks pour réduire la taille du bundle
        manualChunks: {
          // Vendor chunks - bibliothèques tierces
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-pdf': ['jspdf'],
          'vendor-icons': ['lucide-react'],

          // PDF renderer séparé (chargé uniquement pour génération PDF)
          'pdf-renderer': ['@react-pdf/renderer'],
        },
      },
    },
  },

  // Optimisations pour le dev server
  server: {
    hmr: {
      overlay: true,
    },
  },

  // Note: Pour supprimer console.log en production, configurer dans le build:
  // esbuild: { drop: ['console', 'debugger'] }
  // Mais cela nécessite une config séparée pour dev vs prod
})
