/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import eslint from 'vite-plugin-eslint'
import { copy } from 'vite-plugin-copy'
import fs from 'fs'
import http2ProxyPlugin from './vite-http2-proxy-plugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        babel: {
          parserOpts: {
            plugins: ['decorators-legacy', 'classProperties'],
          },
        },
      }),
      http2ProxyPlugin({
        '^/api': {
          target: 'https://localhost:8443/rapidex',
          secure: false,
          timeout: 30000, // 30 segundos
          changeOrigin: true
          // Não faz rewrite, mantém o path /api/v1 completo
        }
      }),
      // eslint({ // Temporariamente comentado durante desenvolvimento
      //   emitWarning: false
      // }),
      copy({
        targets: [
          {
            src: 'src/locales/**',
            dest: 'dist/locales',
          },
        ],
        verbose: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@views': path.resolve(__dirname, './src/views'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@theme': path.resolve(__dirname, './src/theme'),
        '@auth': path.resolve(__dirname, './src/auth'),
        '@ioc': path.resolve(__dirname, './src/ioc'),
        '@navigation': path.resolve(__dirname, './src/navigation'),
        '@locales': path.resolve(__dirname, './src/locales'),
      },
    },
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      port: 4202,
      https: {
        key: fs.readFileSync('certificate/localhost-key.pem'),
        cert: fs.readFileSync('certificate/localhost.pem')
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    optimizeDeps: {
      exclude: ['archbase-react'],
      include: ['lodash.debounce'],
      esbuildOptions: {
        target: 'es2020'
      }
    },
    define: {
      global: 'globalThis',
    },
    ssr: {
      noExternal: ['lodash.debounce']
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTest.ts',
    },
    base: '/',
  }
})