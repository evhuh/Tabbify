
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(), 
    {
      name: 'copy-manifest',
      closeBundle() { 
        // copy manifest
        copyFileSync('manifest.json', 'dist/manifest.json');
        // copy icons
        mkdirSync('dist/icons', { recursive: true });

        const iconDir = 'src/assets/icons';
        readdirSync(iconDir).forEach(file => {
          copyFileSync(`${iconDir}/${file}`, `dist/icons/${file}`);
        });

      }, 
    },
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        home: resolve(__dirname, 'src/home/home.html'),
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js';
          return 'assets/[name]-[hash].js';
        },
      },
    },
    
    outDir: 'dist',
    emptyOutDir: true,
  },
});

