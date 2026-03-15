import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      base: '/marco_os/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion-')) {
                return 'vendor-motion';
              }
              if (id.includes('/contexts/OpenClawContext.tsx') || id.includes('/contexts/openclaw/')) {
                return 'openclaw-core';
              }
              if (
                id.includes('/contexts/SupabaseDataContext.tsx') ||
                id.includes('/contexts/ProjectContext.tsx') ||
                id.includes('/utils/taskMappings.ts') ||
                id.includes('/lib/supabase.ts')
              ) {
                return 'data-sync';
              }
              if (
                id.includes('/components/layout/AppHeader.tsx') ||
                id.includes('/components/layout/AppSidebar.tsx') ||
                id.includes('/components/layout/MobileNav.tsx') ||
                id.includes('/components/NotificationCenter.tsx')
              ) {
                return 'app-shell';
              }
            },
          },
        },
      },
    };
});
