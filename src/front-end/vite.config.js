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
            '@': path.resolve(__dirname, './src'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@components': path.resolve(__dirname, './src/components'),
            '@layouts': path.resolve(__dirname, './src/layouts'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@routes': path.resolve(__dirname, './src/routes'),
            '@services': path.resolve(__dirname, './src/services'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@config': path.resolve(__dirname, './src/config'),
            '@contexts': path.resolve(__dirname, './src/contexts'),
            '@assets': path.resolve(__dirname, './src/assets'),
        },
    },
});
