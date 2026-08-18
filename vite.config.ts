import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png'],
            injectManifest: {
                // Don't cache-bust URLs that already have hashes (Vite assets)
                dontCacheBustURLsMatching: /\.[a-f0-9]{8}\./,
            },
            devOptions: {
                enabled: true,
                type: 'module',
            },
            manifest: {
                short_name: 'simpleBudget',
                name: 'simpleBudget: Keep on track for your goals!',
                description: "It's a simple budget to track your in vs out.",
                icons: [
                    {
                        src: 'favicon.ico',
                        sizes: '64x64 32x32 24x24 16x16',
                        type: 'image/x-icon',
                        purpose: 'any',
                    },
                    {
                        src: 'android-chrome-192x192.png',
                        type: 'image/png',
                        sizes: '192x192',
                        purpose: 'any',
                    },
                    {
                        src: 'android-chrome-512x512.png',
                        type: 'image/png',
                        sizes: '512x512',
                        purpose: 'any',
                    },
                    {
                        src: 'android-chrome-192x192.png',
                        type: 'image/png',
                        sizes: '192x192',
                        purpose: 'maskable',
                    },
                    {
                        src: 'android-chrome-512x512.png',
                        type: 'image/png',
                        sizes: '512x512',
                        purpose: 'maskable',
                    },
                ],
                start_url: '.',
                display: 'standalone',
                theme_color: '#4c809e',
                background_color: '#121212',
            },
        }),
    ],
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'build',
    },
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: './src/test/setup.ts',
    },
});
