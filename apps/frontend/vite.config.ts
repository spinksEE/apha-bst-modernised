import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'node:http';

const backendUrl = process.env.VITE_API_URL || 'http://localhost:3001';

function healthMiddlewarePlugin() {
  return {
    name: 'health-json-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/health' || req.method !== 'GET') {
          next();
          return;
        }

        const proxyUrl = `${backendUrl}/api/health`;

        http
          .get(proxyUrl, (proxyRes) => {
            let body = '';
            proxyRes.on('data', (chunk: Buffer) => {
              body += chunk.toString();
            });
            proxyRes.on('end', () => {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = proxyRes.statusCode ?? 502;
              res.end(body);
            });
          })
          .on('error', () => {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 502;
            res.end(
              JSON.stringify({
                status: 'error',
                database: 'unknown',
                uptime: 0,
              }),
            );
          });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), healthMiddlewarePlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
