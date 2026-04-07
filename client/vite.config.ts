import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const wsTarget = env.VITE_EVENNIA_WS_PROXY_TARGET || 'ws://127.0.0.1:4002'
  const portalTarget = env.VITE_EVENNIA_PORTAL_PROXY_TARGET || 'http://127.0.0.1:4001'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/evennia-portal': {
          target: portalTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/evennia-portal/, '') || '/',
        },
        '/evennia-ws': {
          target: wsTarget,
          changeOrigin: true,
          ws: true,
          rewriteWsOrigin: true,
          rewrite: (path) => {
            const q = path.indexOf('?')
            const search = q >= 0 ? path.slice(q) : ''
            return `/${search}`
          },
        },
      },
    },
  }
})
