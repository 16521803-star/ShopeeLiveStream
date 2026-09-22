import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative asset paths work on all free hostings (Vercel, Netlify, GitHub Pages)
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
