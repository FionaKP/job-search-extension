import { defineConfig } from 'vite';
import path from 'path';

/**
 * Standalone build for the Gmail injection bundle.
 *
 * Produces a single self-contained IIFE at dist/gmail-inject.js (fixed name, no
 * hashing) by bundling src/content/gmail.ts and everything it imports. This file
 * is injected into Gmail tabs by the background service worker via
 * chrome.scripting.executeScript — which runs it directly, avoiding the dynamic
 * import that Gmail's CSP blocks in the normal crxjs content-script loader.
 *
 * Runs after the main crxjs build (see the "build" script); emptyOutDir:false so
 * it appends to dist/ without wiping the crxjs output.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/content/gmail.ts'),
      formats: ['iife'],
      name: 'JobFlowGmail',
      fileName: () => 'gmail-inject.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'gmail-inject.js',
      },
    },
  },
});
