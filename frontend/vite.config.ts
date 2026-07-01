import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['superchat.test', 'localhost'],
    // When behind nginx in Docker, HMR WebSocket must connect via nginx (wss on 443)
    hmr: process.env.DOCKER_DEV === 'true' ? { clientPort: 443, protocol: 'wss' } : undefined,
  },
});
