import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss(), svgr()],
    resolve: {
        alias: {
            '@': path.resolve('./src'),
            '@features': path.resolve('./src/features'),
            '@hooks': path.resolve('./src/hooks'),
            '@components': path.resolve('./src/components'),
            '@layouts': path.resolve('./src/layouts'),
            '@pages': path.resolve('./src/pages'),
            '@routes': path.resolve('./src/routes'),
            '@services': path.resolve('./src/services'),
            '@utils': path.resolve('./src/utils'),
            '@config': path.resolve('./src/config'),
            '@contexts': path.resolve('./src/contexts'),
            '@assets': path.resolve('./src/assets'),
            '@styles': path.resolve('./src/styles'),
        },
    },
});
