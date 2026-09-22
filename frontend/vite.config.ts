import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// Optional dev proxy for running `pnpm dev` on the host without Docker.
// In Docker, nginx already proxies /api — Vite never sees those requests.
const devApiProxyTarget = process.env.DEV_API_PROXY_TARGET;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['superchat.test', 'localhost'],
    // When behind nginx in Docker, HMR WebSocket must connect via nginx (wss on 443)
    hmr: process.env.DOCKER_DEV === 'true' ? { clientPort: 443, protocol: 'wss' } : undefined,
    proxy: devApiProxyTarget
      ? {
          '/api': {
            target: devApiProxyTarget,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
        }
      : undefined,
  },
});
